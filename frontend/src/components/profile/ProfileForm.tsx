import React, { useState, useEffect } from 'react';
import { type User, type Gender } from '../../types/user' // Adjust path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming custom components
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';

interface ProfileFormProps {
  user: User;
  isEditing: boolean;
  isSaving: boolean;
  onSave: (data: Partial<User>) => void;
  onCancel: () => void;
}

const safeGender = (gender?: Gender): Gender =>
  gender && ['male', 'female', 'other', 'prefer_not_to_say'].includes(gender)
    ? gender
    : 'prefer_not_to_say';


// Editable fields from the user model
type EditableUserData = {
  username: string;
  about: string;
  age: number | string; // Use string for input compatibility
  gender: Gender;
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, isEditing, isSaving, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EditableUserData>({
    username: user.username || "",
    about: user.about || '',
    age: user.age || '',
    gender: safeGender(user.gender)
  });

  // Reset form if user data changes or editing is cancelled
  useEffect(() => {
    setFormData({
      username: user.username || "",
      about: user.about || '',
      age: user.age || '',
      gender: safeGender(user.gender), // And here
    });
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (value: Gender) => {
    setFormData({ ...formData, gender: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      age: Number(formData.age) || undefined, // Convert age back to number or undefined
    };
    onSave(dataToSave);
  };

  // View Mode
  if (!isEditing) {
    return (
      <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">About Me</h3>
          <p className="whitespace-pre-wrap">{user.about || 'No information provided.'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Topics of Interest</h3>
          <div className="flex flex-wrap gap-2">
            {user.topics && user.topics.length > 0 ? user.topics.map(topic => (
              <span key={topic} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {topic}
              </span>
            )) : <p>No topics added.</p>}
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Username">
        <Input name="username" value={formData.username} onChange={handleChange} placeholder="Your username" />
      </FormField>

      <FormField label="About Me">
        <Textarea name="about" value={formData.about} onChange={handleChange} rows={4} placeholder="Tell everyone a little about yourself..." />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Age">
          <Input
            name="age"
            type="number"
            value={formData.age === '' ? '' : formData.age}
            onChange={handleChange}
            placeholder="Your age"
          />
        </FormField>
        <FormField label="Gender">
          <Select onValueChange={handleGenderChange} value={formData.gender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// A helper component for form fields
const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    {children}
  </div>
);