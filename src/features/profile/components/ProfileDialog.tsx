import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { useUpdateProfileMutation } from '@/services/api/profile';
import { IUserProfile } from '@/services/api/profile/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  username: z
    .string({ message: 'Username is required' })
    .min(3, { message: 'Username is too short' })
    .max(20, { message: 'Username is too long' }),
  fullName: z
    .string({ message: 'Full name is required' })
    .regex(/^[A-Za-z\s]+$/, 'Invalid full name'),
  email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address.' }),
  phoneNumber: z
    .string({ message: 'Phone number is required' })
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/, 'Phone number is invalid')
    .min(6, { message: 'Phone number must be at least 6 characters.' }),
  avatar: z.string({ message: 'Avatar is required' }),
});

export function ProfileDialog({
  isOpen,
  onOpenChange,
  defaultValues,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultValues: IUserProfile;
}) {
  const methods = useForm<IUserProfile>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });
  const { handleSubmit, setValue } = methods;
  const [updateProfile, { isSuccess }] = useUpdateProfileMutation();

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/files/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (data.url) {
        setValue('avatar', data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const onSubmit: SubmitHandler<IUserProfile> = async (data) => {
    try {
      await updateProfile(data).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated successfully');
    }
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={methods.control}
                name="avatar"
                render={({ field }) => (
                  <div className="flex gap-1 justify-center">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={field.value} alt="avatar" className="rounded-lg" />
                    </Avatar>
                    <Input type="file" accept="image/*" onChange={handleUploadAvatar} />
                  </div>
                )}
              />
              <FormField
                control={methods.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fullname</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="mail@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={methods.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="+380 (66) 000 00 00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
