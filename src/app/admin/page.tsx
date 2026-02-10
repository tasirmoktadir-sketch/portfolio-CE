"use client";

import * as React from "react";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useAuth, useCollection, useFirestore } from "@/firebase";
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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  embedId: z.string().min(1, "YouTube Embed ID is required"),
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface VideoProject extends VideoFormValues {
  id: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const videoProjectsCollection = firestore
    ? collection(firestore, "videoProjects")
    : null;
  const { data: videoProjects, loading: dataLoading } =
    useCollection<VideoProject>(videoProjectsCollection);

  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] =
    React.useState<VideoProject | null>(null);

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
      reset({ title: "", description: "", embedId: "" });
    }
  }, [editingVideo, reset]);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingVideo(null);
    }
    setDialogOpen(open);
  };

  const onSubmit = async (data: VideoFormValues) => {
    if (!firestore || !videoProjectsCollection) return;

    try {
      const id = editingVideo ? editingVideo.id : doc(videoProjectsCollection).id;
      const ref = doc(firestore, "videoProjects", id);
      const operation = editingVideo ? 'update' : 'create';
      
      setDoc(ref, data, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation,
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: editingVideo ? "Video Updated" : "Video Added",
        description: `"${data.title}" has been saved.`,
      });

      handleDialogClose(false);
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving the video.",
      });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!firestore) return;

    try {
      const ref = doc(firestore, "videoProjects", id);
      deleteDoc(ref).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      toast({
        title: "Video Deleted",
        description: `"${title}" has been removed.`,
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

  if (authLoading || dataLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the video project.
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
              <div>
                <Label htmlFor="embedId">YouTube Embed ID</Label>
                <Input id="embedId" {...register("embedId")} />
                {errors.embedId && (
                  <p className="text-sm text-destructive">
                    {errors.embedId.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                          onClick={() => handleDelete(video.id, video.title)}
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
    </div>
  );
}
