import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '../validation/profileSchema';
import { type User as UserProfile } from '../../../types/user';
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { toast } from 'react-toastify';

// IMPORTANT: Replace this with your actual ImgBB API key from your .env file
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

interface ProfileFormProps {
  user: UserProfile;
  onSubmit: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
  isUpdating: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isUpdating,
}) => {
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username || '',
      about: user.about || '',
      age: user.age ?? undefined,
      gender: user.gender ?? 'prefer_not_to_say',
      topics: user.topics?.join(', ') || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
    setUploadingImage(true);
    const form = new FormData();
    form.append('image', imageFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      if (data.success) {
        setUploadingImage(false);
        return data.data.url;
      } else {
        setUploadingImage(false);
        // Show a toast error with the API's error message
        toast.error(data.error.message || 'Image upload failed.');
        throw new Error(data.error.message || 'Image upload failed.');
      }
    } catch (error) {
      setUploadingImage(false);
      console.error('Error uploading image to ImgBB:', error);
      // Show a toast error for network or unexpected issues
      toast.error('An error occurred during image upload. Please try again.');
      throw error;
    }
  };

  const handleFormSubmit: SubmitHandler<UpdateProfileFormData> = async (data) => {
    let newProfilePicUrl = user.profilePic;

    if (profilePicFile) {
      try {
        newProfilePicUrl = await uploadImageToImgBB(profilePicFile);
      } catch (error) {
        // The error is already handled by toast, so we just return here
        return;
      }
    }

    const topicsArray = data.topics
      ? data.topics.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload: Partial<UserProfile> = {
      ...data,
      profilePic: newProfilePicUrl,
      topics: topicsArray,
    };

    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Profile Picture and Username section */}
        <div className="flex flex-col items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
          <Label htmlFor="profilePic" className="cursor-pointer group relative block">
            <img
              src={
                profilePicFile
                  ? URL.createObjectURL(profilePicFile)
                  : user.profilePic || "https://www.gravatar.com/avatar/?d=mp"
              }
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-500/50 transition-all group-hover:ring-indigo-500"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2003/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
          </Label>
          <input
            type="file"
            id="profilePic"
            name="profilePic"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full max-w-xs">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Profile Details section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Age" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about yourself..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topics (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., react, nodejs, gaming" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUpdating || uploadingImage}
          >
            {isUpdating || uploadingImage ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
