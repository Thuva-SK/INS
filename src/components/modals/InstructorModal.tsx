import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { type Instructor } from '@/data/dummyData';

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instructor: Omit<Instructor, 'id'>) => void;
  instructor?: Instructor | null;
}

const availableClasses = [
  'CS-101', 'CS-201', 'CS-301',
  'BA-201', 'BA-301', 'BA-401',
  'DM-101', 'DM-201',
  'DS-101', 'DS-201',
  'WD-101', 'WD-201'
];

const InstructorModal: React.FC<InstructorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  instructor
}) => {
  const [formData, setFormData] = useState<Omit<Instructor, 'id'>>({
    name: instructor?.name || '',
    email: instructor?.email || '',
    subject: instructor?.subject || '',
    assignedClasses: instructor?.assignedClasses || [],
    phone: instructor?.phone || '',
    avatar: instructor?.avatar || '',
    joinedDate: instructor?.joinedDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form if adding new instructor
    if (!instructor) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        assignedClasses: [],
        phone: '',
        avatar: '',
        joinedDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleChange = (field: keyof Omit<Instructor, 'id'>, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClassToggle = (className: string, checked: boolean) => {
    const updatedClasses = checked
      ? [...formData.assignedClasses, className]
      : formData.assignedClasses.filter(c => c !== className);
    
    handleChange('assignedClasses', updatedClasses);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {instructor ? 'Edit Instructor' : 'Add New Instructor'}
          </DialogTitle>
          <DialogDescription>
            {instructor 
              ? 'Update instructor information below.'
              : 'Fill in the details to add a new instructor to the system.'
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
                placeholder="instructor@insonlinecollege.edu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject/Department *</Label>
              <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Business Administration">Business Administration</SelectItem>
                  <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="joinedDate">Joined Date *</Label>
              <Input
                id="joinedDate"
                type="date"
                value={formData.joinedDate}
                onChange={(e) => handleChange('joinedDate', e.target.value)}
                required
              />
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
          </div>

          <div className="space-y-2">
            <Label>Assigned Classes</Label>
            <div className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
              {availableClasses.map((className) => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={className}
                    checked={formData.assignedClasses.includes(className)}
                    onCheckedChange={(checked) => handleClassToggle(className, checked as boolean)}
                  />
                  <Label htmlFor={className} className="text-sm font-normal">
                    {className}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select the classes this instructor will teach
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-button-primary">
              {instructor ? 'Update Instructor' : 'Add Instructor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstructorModal;