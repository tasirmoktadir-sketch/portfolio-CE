"use client";

import * as React from "react";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
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
import { PlusCircle, Edit, Trash2, Film, User as UserIcon, Briefcase, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { Skeleton } from "@/components/ui/skeleton";

// Schemas
const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  youtubeEmbedId: z.string().min(1, "YouTube Embed ID is required"),
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

interface VideoProject extends VideoFormValues { id: string; }
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [isVideoDialogOpen, setVideoDialogOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<VideoProject | null>(null);
  
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
    } else {
      videoForm.reset({ title: "", description: "", category: "", youtubeEmbedId: "" });
    }
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
    } else {
      serviceForm.reset({ title: "", description: "" });
    }
  }, [editingService, serviceForm]);
  
  // Effect for testimonial form
  React.useEffect(() => {
    if (editingTestimonial) {
      testimonialForm.reset(editingTestimonial);
    } else {
      testimonialForm.reset({ clientName: "", quote: "" });
    }
  }, [editingTestimonial, testimonialForm]);

  // Handlers
  const onVideoSubmit = async (data: VideoFormValues) => {
    if (!firestore) return;
    setIsSubmitting(true);
    const id = editingVideo ? editingVideo.id : doc(collection(firestore, "videoProjects")).id;
    const ref = doc(firestore, "videoProjects", id);
    const operation = editingVideo ? 'update' : 'create';

    setDoc(ref, data, { merge: true })
      .then(() => {
        toast({ title: `Video ${editingVideo ? "Updated" : "Added"}`, description: `"${data.title}" has been saved.` });
        setVideoDialogOpen(false);
      })
      .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation, requestResourceData: data })))
      .finally(() => setIsSubmitting(false));
  };
  
  const onAboutSubmit = async (data: AboutFormValues) => {
    if (!firestore || !storage || !aboutDocRef) return;
    setIsSubmitting(true);
  
    try {
      let imageUrl = aboutInfo?.profileImageUrl;
      let imagePath = aboutInfo?.profileImageStoragePath;
  
      // Step 1: If there is a new image file, upload it
      if (profileImageFile) {
        const newStoragePath = `images/profile/${Date.now()}_${profileImageFile.name}`;
        const storageRef = ref(storage, newStoragePath);
        
        const snapshot = await uploadBytes(storageRef, profileImageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
        imagePath = newStoragePath;
  
        // Step 2: Kick off deletion of the old image, but don't wait for it.
        if (aboutInfo?.profileImageStoragePath) {
          const oldImageRef = ref(storage, aboutInfo.profileImageStoragePath);
          deleteObject(oldImageRef).catch(err => {
            console.warn("Could not delete old profile image:", err);
          });
        }
      }
  
      // Step 3: Prepare the data to be saved to Firestore
      const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      const dataToSave: Partial<AboutInfo> = {
        name: data.name,
        tagline: data.tagline,
        bio1: data.bio1,
        bio2: data.bio2,
        skills: skillsArray,
        profileImageUrl: imageUrl,
        profileImageStoragePath: imagePath,
      };
  
      // Step 4: Save the data to Firestore
      await setDoc(aboutDocRef, dataToSave, { merge: true });
  
      toast({ title: "About Info Updated", description: "Your information has been saved." });
      setProfileImageFile(null);
  
    } catch (error: any) {
      console.error("Update failed:", error);
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "An error occurred." });
      
      // If the error is not a storage error, it might be a Firestore permission error
      if (error.code && !error.code.startsWith('storage/')) {
        const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
        const dataToSaveForError = { ...aboutInfo, ...data, skills: skillsArray };
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: aboutDocRef.path, operation: 'update', requestResourceData: dataToSaveForError }));
      }
    } finally {
      // Step 5: ALWAYS ensure isSubmitting is set to false
      setIsSubmitting(false);
    }
  };
  
  const onServiceSubmit = async (data: ServiceFormValues) => {
      if (!firestore) return;
      setIsSubmitting(true);
      const id = editingService ? editingService.id : doc(collection(firestore, "services")).id;
      const ref = doc(firestore, "services", id);
      const operation = editingService ? 'update' : 'create';
      setDoc(ref, data, { merge: true })
        .then(() => {
            toast({ title: `Service ${editingService ? 'Updated' : 'Added'}`, description: `"${data.title}" has been saved.` });
            setServiceDialogOpen(false);
        })
        .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation, requestResourceData: data })))
        .finally(() => setIsSubmitting(false));
  };
  
  const onTestimonialSubmit = async (data: TestimonialFormValues) => {
      if (!firestore) return;
      setIsSubmitting(true);
      const id = editingTestimonial ? editingTestimonial.id : doc(collection(firestore, "testimonials")).id;
      const ref = doc(firestore, "testimonials", id);
      const operation = editingTestimonial ? 'update' : 'create';
      setDoc(ref, data, { merge: true })
        .then(() => {
            toast({ title: `Testimonial ${editingTestimonial ? 'Updated' : 'Added'}`, description: `From "${data.clientName}" has been saved.` });
            setTestimonialDialogOpen(false);
        })
        .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation, requestResourceData: data })))
        .finally(() => setIsSubmitting(false));
  };

  const handleDelete = async (collectionName: string, item: { id: string; title?: string; clientName?: string; storagePath?: string; }) => {
    if (!firestore) return;

    if (collectionName === 'videoProjects' && item.storagePath) {
        if (!storage) return;
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
                    <Input {...videoForm.register("category")} placeholder="Category (e.g. Commercial)" />
                    <Input {...videoForm.register("youtubeEmbedId")} placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)" />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {videoLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {videoProjects?.map((video) => (<TableRow key={video.id}><TableCell>{video.title}</TableCell><TableCell>{video.category}</TableCell><TableCell>{video.description}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setEditingVideo(video); setVideoDialogOpen(true);}}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete "{video.title}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('videoProjects', video)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
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
                <div><Label>Profile Picture</Label><Input type="file" accept="image/*" onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)} disabled={isSubmitting}/></div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save About Info'}
                </Button>
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
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {servicesLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {services?.map((service) => (<TableRow key={service.id}><TableCell>{service.title}</TableCell><TableCell>{service.description}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setEditingService(service); setServiceDialogOpen(true);}}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete "{service.title}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('services', service)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
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
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent><Table>
              <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Quote</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {testimonialsLoading && [...Array(3)].map((_, i) => <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-5 w-full" /></TableCell></TableRow>)}
                {testimonials?.map((testimonial) => (<TableRow key={testimonial.id}><TableCell>{testimonial.clientName}</TableCell><TableCell>{testimonial.quote}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => { setEditingTestimonial(testimonial); setTestimonialDialogOpen(true); }}><Edit /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete the testimonial from "{testimonial.clientName}".</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('testimonials', testimonial)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))}
              </TableBody>
            </Table></CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
