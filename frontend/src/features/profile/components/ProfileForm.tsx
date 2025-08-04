import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '../validation/profileSchema';
import { type User as UserProfile } from '../../../types/user';
import { Input } from '../../../components/ui/customUI/Input';
// import { Textarea } from '../../../components/ui/customUI/Textarea'; // If you have it
// import { Select } from '../../../components/ui/customUI/Select';     // If you have it

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username || '',
      profilePic: user.profilePic || '',
      about: user.about || '',
      age: user.age ?? undefined,
      gender: user.gender ?? 'prefer_not_to_say',
      topics: user.topics?.join(', ') || '',
    },
  });

  const handleFormSubmit: SubmitHandler<UpdateProfileFormData> = (data) => {
    const topicsArray = data.topics
      ? data.topics.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload: Partial<UserProfile> = {
      ...data,
      topics: topicsArray,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Username"
          {...register('username')}
          error={errors.username?.message}
        />
        <Input
          label="Age"
          type="number"
          {...register('age', { valueAsNumber: true })}
          error={errors.age?.message}
        />
      </div>

      <Input
        label="Profile Picture URL"
        {...register('profilePic')}
        error={errors.profilePic?.message}
      />

      {/* If you have a Textarea component */}
      {/* <Textarea label="About Me" {...register('about')} error={errors.about?.message} /> */}

      {/* If you have a Select component */}
      {/* <Select label="Gender" {...register('gender')} error={errors.gender?.message}>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </Select> */}

      <Input
        label="Topics (comma-separated)"
        {...register('topics')}
        error={errors.topics?.message}
        placeholder="e.g., react, nodejs, gaming"
      />

      <div className="flex items-center justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
