"use client";

import * as React from "react";
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useUser, useFirestore, useStorage, useCollection } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  Edit,
  Trash2,
  Film,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface VideoProject extends VideoFormValues {
  id: string;
  videoUrl: string;
  storagePath: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const videoProjectsCollection = firestore
    ? collection(firestore, "videoProjects")
    : null;
  const { data: videoProjects, loading: dataLoading } =
    useCollection<VideoProject>(videoProjectsCollection);

  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] =
    React.useState<VideoProject | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null
  );
  const [videoFile, setVideoFile] = React.useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (editingVideo) {
      reset(editingVideo);
      setDialogOpen(true);
    } else {
      reset({ title: "", description: "" });
    }
    setVideoFile(null);
    setUploadProgress(null);
  }, [editingVideo, reset]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingVideo(null);
    }
    setDialogOpen(open);
  };

  const onSubmit = async (data: VideoFormValues) => {
    if (!firestore || !storage) return;

    if (editingVideo) {
      // Editing existing video metadata
      const ref = doc(firestore, "videoProjects", editingVideo.id);
      setDoc(ref, data, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      toast({
        title: "Video Updated",
        description: `"${data.title}" has been saved.`,
      });
      handleDialogClose(false);
    } else {
      // Adding new video
      if (!videoFile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a video file to upload.",
        });
        return;
      }

      const storagePath = `videos/${Date.now()}_${videoFile.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "There was a problem uploading your video.",
          });
          setUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const id = doc(collection(firestore, "videoProjects")).id;
            const docRef = doc(firestore, "videoProjects", id);
            const videoData = {
              ...data,
              videoUrl: downloadURL,
              storagePath: storagePath,
            };
            
            setDoc(docRef, videoData).catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: videoData,
              });
              errorEmitter.emit('permission-error', permissionError);
            });

            toast({
              title: "Video Added",
              description: `"${data.title}" has been uploaded and saved.`,
            });
            handleDialogClose(false);
          });
        }
      );
    }
  };

  const handleDelete = async (video: VideoProject) => {
    if (!firestore || !storage) return;

    // Delete from Storage
    const videoRef = ref(storage, video.storagePath);
    deleteObject(videoRef).catch((error) => {
        console.error("Error deleting video from storage: ", error);
        toast({
            variant: "destructive",
            title: "Storage Error",
            description: "Could not delete the video file from storage.",
        });
    });

    // Delete from Firestore
    try {
      const ref = doc(firestore, "videoProjects", video.id);
      deleteDoc(ref).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      toast({
        title: "Video Deleted",
        description: `"${video.title}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the video.",
      });
    }
  };

  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataLoading ? (
                <Skeleton className="h-8 w-1/4" />
              ) : (
                videoProjects?.length ?? 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">Placeholder data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Placeholder data</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Video Projects</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVideo(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? "Edit Video" : "Add New Video"}
                </DialogTitle>
                <DialogDescription>
                  {editingVideo ? "Update the details for the video project." : "Fill in the details and upload a video file."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" {...register("description")} />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                {!editingVideo && (
                  <div>
                    <Label htmlFor="video">Video File</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                    />
                    {uploadProgress !== null && (
                      <Progress value={uploadProgress} className="w-full mt-2" />
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={uploadProgress !== null && uploadProgress < 100}>
                    {uploadProgress !== null ? `Uploading... ${Math.round(uploadProgress)}%` : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLoading && (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                    </TableRow>
                  ))
                )}
                {videoProjects?.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingVideo(video)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete the video "{video.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(video)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
