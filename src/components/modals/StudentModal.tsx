import React, { useState } from 'react';
import { X } from 'lucide-react';
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
import { type Student } from '@/data/dummyData';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id'>) => void;
  student?: Student | null;
}

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student
}) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: student?.name || '',
    email: student?.email || '',
    studentId: student?.studentId || '',
    course: student?.course || '',
    class: student?.class || '',
    status: student?.status || 'active',
    enrolledDate: student?.enrolledDate || new Date().toISOString().split('T')[0],
    phone: student?.phone || '',
    avatar: student?.avatar || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form if adding new student
    if (!student) {
      setFormData({
        name: '',
        email: '',
        studentId: '',
        course: '',
        class: '',
        status: 'active',
        enrolledDate: new Date().toISOString().split('T')[0],
        phone: '',
        avatar: ''
      });
    }
  };

  const handleChange = (field: keyof Omit<Student, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateStudentId = () => {
    const prefix = 'INS';
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const newId = `${prefix}${randomNum}`;
    handleChange('studentId', newId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            {student 
              ? 'Update student information below.'
              : 'Fill in the details to add a new student to the system.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@email.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  placeholder="INS001"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateStudentId}
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={formData.course} onValueChange={(value) => handleChange('course', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Business Administration">Business Administration</SelectItem>
                  <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select value={formData.class} onValueChange={(value) => handleChange('class', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS-101">CS-101</SelectItem>
                  <SelectItem value="CS-201">CS-201</SelectItem>
                  <SelectItem value="BA-201">BA-201</SelectItem>
                  <SelectItem value="BA-301">BA-301</SelectItem>
                  <SelectItem value="DM-101">DM-101</SelectItem>
                  <SelectItem value="DS-101">DS-101</SelectItem>
                  <SelectItem value="WD-101">WD-101</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrolledDate">Enrolled Date *</Label>
              <Input
                id="enrolledDate"
                type="date"
                value={formData.enrolledDate}
                onChange={(e) => handleChange('enrolledDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Profile Image URL</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-button-primary">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;