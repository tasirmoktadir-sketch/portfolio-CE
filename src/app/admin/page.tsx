"use client";

import * as React from "react";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { useUser, useFirestore, useStorage, useCollection, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Film, User as UserIcon, Briefcase, Star, Eye, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// Schemas
const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  bio1: z.string().min(1, "Bio paragraph 1 is required"),
  bio2: z.string().min(1, "Bio paragraph 2 is required"),
  skills: z.string().min(1, "Skills are required"),
});
const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
const testimonialSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  quote: z.string().min(1, "Quote is required"),
});

// Types
type VideoFormValues = z.infer<typeof videoSchema>;
type AboutFormValues = z.infer<typeof aboutSchema>;
type ServiceFormValues = z.infer<typeof serviceSchema>;
type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface VideoProject extends VideoFormValues { id: string; videoUrl: string; storagePath: string; }
interface Service extends ServiceFormValues { id: string; }
interface Testimonial extends TestimonialFormValues { id: string; }
interface AboutInfo extends Omit<AboutFormValues, 'skills'> { skills: string[]; profileImageUrl: string; profileImageStoragePath: string; }


export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  // Data hooks
  const videoProjectsCollection = firestore ? collection(firestore, "videoProjects") : null;
  const { data: videoProjects, loading: videoLoading } = useCollection<VideoProject>(videoProjectsCollection);
  const servicesCollection = firestore ? collection(firestore, "services") : null;
  const { data: services, loading: servicesLoading } = useCollection<Service>(servicesCollection);
  const testimonialsCollection = firestore ? collection(firestore, "testimonials") : null;
  const { data: testimonials, loading: testimonialsLoading } = useCollection<Testimonial>(testimonialsCollection);
  const aboutDocRef = firestore ? doc(firestore, "siteContent", "about") : null;
  const { data: aboutInfo, loading: aboutLoading } = useDoc<AboutInfo>(aboutDocRef);

  // State
  const [isVideoDialogOpen, setVideoDialogOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<VideoProject | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = React.useState<File | null>(null);
  
  const [isServiceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);

  const [isTestimonialDialogOpen, setTestimonialDialogOpen] = React.useState(false);
  const [editingTestimonial, setEditingTestimonial] = React.useState<Testimonial | null>(null);

  // Forms
  const videoForm = useForm<VideoFormValues>({ resolver: zodResolver(videoSchema) });
  const aboutForm = useForm<AboutFormValues>({ resolver: zodResolver(aboutSchema) });
  const serviceForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) });
  const testimonialForm = useForm<TestimonialFormValues>({ resolver: zodResolver(testimonialSchema) });


  React.useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Effect for video form
  React.useEffect(() => {
    if (editingVideo) {
      videoForm.reset(editingVideo);
      setVideoDialogOpen(true);
    } else {
      videoForm.reset({ title: "", description: "" });
    }
    setVideoFile(null);
    setUploadProgress(null);
  }, [editingVideo, videoForm]);

  // Effect for about form
  React.useEffect(() => {
    if (aboutInfo) {
      aboutForm.reset({
        ...aboutInfo,
        skills: aboutInfo.skills.join(', '),
      });
    }
  }, [aboutInfo, aboutForm]);
  
  // Effect for service form
  React.useEffect(() => {
    if (editingService) {
      serviceForm.reset(editingService);
      setServiceDialogOpen(true);
    } else {
      serviceForm.reset({ title: "", description: "" });
    }
  }, [editingService, serviceForm]);
  
  // Effect for testimonial form
  React.useEffect(() => {
    if (editingTestimonial) {
      testimonialForm.reset(editingTestimonial);
      setTestimonialDialogOpen(true);
    } else {
      testimonialForm.reset({ clientName: "", quote: "" });
    }
  }, [editingTestimonial, testimonialForm]);

  // Handlers
  const onVideoSubmit = async (data: VideoFormValues) => {
    if (!firestore || !storage) return;

    if (editingVideo) {
      const ref = doc(firestore, "videoProjects", editingVideo.id);
      setDoc(ref, data, { merge: true }).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'update', requestResourceData: data })));
      toast({ title: "Video Updated", description: `"${data.title}" has been saved.` });
      setVideoDialogOpen(false);
    } else {
      if (!videoFile) return toast({ variant: "destructive", title: "Error", description: "Please select a video file." });
      const storagePath = `videos/${Date.now()}_${videoFile.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);
      uploadTask.on("state_changed", (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => {
          console.error("Upload failed:", error);
          toast({ variant: "destructive", title: "Upload Error", description: "There was a problem uploading your video." });
          setUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const id = doc(collection(firestore, "videoProjects")).id;
            const docRef = doc(firestore, "videoProjects", id);
            const videoData = { ...data, videoUrl: downloadURL, storagePath: storagePath };
            setDoc(docRef, videoData).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'create', requestResourceData: videoData })));
            toast({ title: "Video Added", description: `"${data.title}" has been saved.` });
            setVideoDialogOpen(false);
          });
        }
      );
    }
  };
  
  const onAboutSubmit = async (data: AboutFormValues) => {
    if (!firestore || !storage || !aboutDocRef) return;
    setUploadProgress(0);

    const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
    let profileImageUrl = aboutInfo?.profileImageUrl || "";
    let profileImageStoragePath = aboutInfo?.profileImageStoragePath || "";

    if (profileImageFile) {
        profileImageStoragePath = `images/profile/${Date.now()}_${profileImageFile.name}`;
        const storageRef = ref(storage, profileImageStoragePath);
        const uploadTask = uploadBytesResumable(storageRef, profileImageFile);

        await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                (error) => {
                    console.error("Image upload failed:", error);
                    toast({ variant: "destructive", title: "Upload Error", description: "Could not upload profile image." });
                    setUploadProgress(null);
                    reject(error);
                },
                async () => {
                    profileImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve();
                }
            );
        });
    }

    const aboutData = { ...data, skills: skillsArray, profileImageUrl, profileImageStoragePath };
    setDoc(aboutDocRef, aboutData, { merge: true }).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: aboutDocRef.path, operation: 'update', requestResourceData: aboutData })));
    toast({ title: "About Info Updated", description: "Your information has been saved." });
    setUploadProgress(null);
    setProfileImageFile(null);
  };
  
  const onServiceSubmit = async (data: ServiceFormValues) => {
      if (!firestore) return;
      const id = editingService ? editingService.id : doc(collection(firestore, "services")).id;
      const ref = doc(firestore, "services", id);
      const operation = editingService ? 'update' : 'create';
      setDoc(ref, data, { merge: true }).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation, requestResourceData: data })));
      toast({ title: `Service ${editingService ? 'Updated' : 'Added'}`, description: `"${data.title}" has been saved.` });
      setServiceDialogOpen(false);
  };
  
  const onTestimonialSubmit = async (data: TestimonialFormValues) => {
      if (!firestore) return;
      const id = editingTestimonial ? editingTestimonial.id : doc(collection(firestore, "testimonials")).id;
      const ref = doc(firestore, "testimonials", id);
      const operation = editingTestimonial ? 'update' : 'create';
      setDoc(ref, data, { merge: true }).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation, requestResourceData: data })));
      toast({ title: `Testimonial ${editingTestimonial ? 'Updated' : 'Added'}`, description: `From "${data.clientName}" has been saved.` });
      setTestimonialDialogOpen(false);
  };

  const handleDelete = async (collectionName: string, item: { id: string; title?: string; clientName?: string; storagePath?: string; }) => {
    if (!firestore || !storage) return;

    if (item.storagePath) { // For videos
      deleteObject(ref(storage, item.storagePath)).catch(err => console.error("Error deleting from storage: ", err));
    }
    
    const docRef = doc(firestore, collectionName, item.id);
    deleteDoc(docRef).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })));
    toast({ title: "Item Deleted", description: `"${item.title || item.clientName}" has been removed.` });
  };

  if (authLoading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="videos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos"><Film className="mr-2 h-4 w-4" />Videos</TabsTrigger>
          <TabsTrigger value="about"><UserIcon className="mr-2 h-4 w-4" />About</TabsTrigger>
          <TabsTrigger value="services"><Briefcase className="mr-2 h-4 w-4" />Services</TabsTrigger>
          <TabsTrigger value="testimonials"><Star className="mr-2 h-4 w-4" />Testimonials</TabsTrigger>
        </TabsList>
        
        {/* VIDEO TAB */}
        <TabsContent value="videos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Projects</CardTitle>
              <Dialog open={isVideoDialogOpen} onOpenChange={(open) => { if (!open) setEditingVideo(null); setVideoDialogOpen(open); }}>
                <DialogTrigger asChild><Button onClick={() => setEditingVideo(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Video</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingVideo ? "Edit" : "Add"} Video</DialogTitle></DialogHeader>
                  <form onSubmit={videoForm.handleSubmit(onVideoSubmit)} className="space-y-4">
                    <Input {...videoForm.register("title")} placeholder="Title" />
                    <Input {...videoForm.register("description")} placeholder="Description" />
                    {!editingVideo && <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />}
                    {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
                    <DialogFooter><Button type="submit" disabled={uploadProgress !== null && uploadProgress < 100}>{uploadProgress !== null ? `Uploading...` : "Save"}</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {videoLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {videoProjects?.map((video) => (<TableRow key={video.id}><TableCell>{video.title}</TableCell><TableCell>{video.description}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setEditingVideo(video)}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete "{video.title}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('videoProjects', video)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
              </TableBody>
            </Table></CardContent>
          </Card>
        </TabsContent>
        
        {/* ABOUT TAB */}
        <TabsContent value="about">
          <Card>
            <CardHeader><CardTitle>About Page Content</CardTitle></CardHeader>
            <CardContent>
              {aboutLoading ? <Skeleton className="h-96 w-full" /> : (
              <form onSubmit={aboutForm.handleSubmit(onAboutSubmit)} className="space-y-4">
                <div><Label>Name</Label><Input {...aboutForm.register("name")} /></div>
                <div><Label>Tagline</Label><Input {...aboutForm.register("tagline")} /></div>
                <div><Label>Bio Paragraph 1</Label><Textarea {...aboutForm.register("bio1")} /></div>
                <div><Label>Bio Paragraph 2</Label><Textarea {...aboutForm.register("bio2")} /></div>
                <div><Label>Skills (comma-separated)</Label><Textarea {...aboutForm.register("skills")} /></div>
                <div><Label>Profile Picture</Label><Input type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} /></div>
                {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
                <Button type="submit" disabled={uploadProgress !== null && uploadProgress > 0 && uploadProgress < 100}>{uploadProgress !== null && uploadProgress < 100 ? `Uploading...` : "Save About Info"}</Button>
              </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICES TAB */}
        <TabsContent value="services">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Dialog open={isServiceDialogOpen} onOpenChange={(open) => { if (!open) setEditingService(null); setServiceDialogOpen(open); }}>
                <DialogTrigger asChild><Button onClick={() => setEditingService(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingService ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
                  <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-4">
                    <Input {...serviceForm.register("title")} placeholder="Service Title" />
                    <Textarea {...serviceForm.register("description")} placeholder="Service Description" />
                    <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {servicesLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {services?.map((service) => (<TableRow key={service.id}><TableCell>{service.title}</TableCell><TableCell>{service.description}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setEditingService(service)}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete "{service.title}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('services', service)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
              </TableBody>
            </Table></CardContent>
          </Card>
        </TabsContent>

        {/* TESTIMONIALS TAB */}
        <TabsContent value="testimonials">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Testimonials</CardTitle>
              <Dialog open={isTestimonialDialogOpen} onOpenChange={(open) => { if (!open) setEditingTestimonial(null); setTestimonialDialogOpen(open); }}>
                <DialogTrigger asChild><Button onClick={() => setEditingTestimonial(null)}><PlusCircle className="mr-2 h-4 w-4" /> Add Testimonial</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingTestimonial ? "Edit" : "Add"} Testimonial</DialogTitle></DialogHeader>
                  <form onSubmit={testimonialForm.handleSubmit(onTestimonialSubmit)} className="space-y-4">
                    <Input {...testimonialForm.register("clientName")} placeholder="Client Name" />
                    <Textarea {...testimonialForm.register("quote")} placeholder="Client's quote..." />
                    <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Quote</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {testimonialsLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {testimonials?.map((testimonial) => (<TableRow key={testimonial.id}><TableCell>{testimonial.clientName}</TableCell><TableCell>{testimonial.quote}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setEditingTestimonial(testimonial)}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete the testimonial from "{testimonial.clientName}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('testimonials', testimonial)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
              </TableBody>
            </Table></CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
