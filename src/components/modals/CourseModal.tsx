import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Course } from '@/data/dummyData';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Omit<Course, 'id'>) => void;
  course?: Course | null;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  course
}) => {
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    title: course?.title || '',
    code: course?.code || '',
    instructor: course?.instructor || '',
    duration: course?.duration || '',
    fee: course?.fee || 0,
    description: course?.description || '',
    enrolledStudents: course?.enrolledStudents || 0,
    status: course?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form if adding new course
    if (!course) {
      setFormData({
        title: '',
        code: '',
        instructor: '',
        duration: '',
        fee: 0,
        description: '',
        enrolledStudents: 0,
        status: 'active'
      });
    }
  };

  const handleChange = (field: keyof Omit<Course, 'id'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCourseCode = () => {
    const title = formData.title;
    if (title) {
      const words = title.split(' ');
      const prefix = words.map(word => word.charAt(0)).join('').toUpperCase();
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const newCode = `${prefix}-${randomNum}`;
      handleChange('code', newCode);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogDescription>
            {course 
              ? 'Update course information below.'
              : 'Fill in the details to create a new course.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  placeholder="CS-101"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateCourseCode}
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Select value={formData.instructor} onValueChange={(value) => handleChange('instructor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Emily Chen">Dr. Emily Chen</SelectItem>
                  <SelectItem value="Prof. Robert Williams">Prof. Robert Williams</SelectItem>
                  <SelectItem value="Ms. Sarah Cooper">Ms. Sarah Cooper</SelectItem>
                  <SelectItem value="Dr. Michael Johnson">Dr. Michael Johnson</SelectItem>
                  <SelectItem value="Prof. Lisa Anderson">Prof. Lisa Anderson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4 weeks">4 weeks</SelectItem>
                  <SelectItem value="6 weeks">6 weeks</SelectItem>
                  <SelectItem value="8 weeks">8 weeks</SelectItem>
                  <SelectItem value="12 weeks">12 weeks</SelectItem>
                  <SelectItem value="16 weeks">16 weeks</SelectItem>
                  <SelectItem value="20 weeks">20 weeks</SelectItem>
                  <SelectItem value="24 weeks">24 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Course Fee ($) *</Label>
              <Input
                id="fee"
                type="number"
                value={formData.fee}
                onChange={(e) => handleChange('fee', parseInt(e.target.value) || 0)}
                placeholder="2500"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enrolledStudents">Current Enrollments</Label>
              <Input
                id="enrolledStudents"
                type="number"
                value={formData.enrolledStudents}
                onChange={(e) => handleChange('enrolledStudents', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter course description, objectives, and key topics..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-button-primary">
              {course ? 'Update Course' : 'Add Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;