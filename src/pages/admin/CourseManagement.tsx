import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';

const PLACEHOLDER = 'https://via.placeholder.com/80x60?text=No+Image';

type Course = {
  id: string;
  name: string;
  description: string;
  status: string;
  image_url?: string;
  created_at: string;
};

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active', image: null as File | null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch courses from Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;
    if (name === 'image' && files && files[0]) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let image_url = '';
    if (form.image) {
      const fileExt = form.image.name.split('.').pop();
      const filePath = `course/${Date.now()}-${form.image.name}`;
      const { data: storageData, error: storageError } = await supabase.storage.from('course-image').upload(filePath, form.image, { upsert: true });
      if (!storageError && storageData) {
        image_url = supabase.storage.from('course-image').getPublicUrl(filePath).data.publicUrl;
      }
    }
    const payload = { name: form.name, description: form.description, status: form.status, image_url: image_url || undefined };
    if (editingCourse) {
      await supabase.from('courses').update(payload).eq('id', editingCourse.id);
    } else {
      await supabase.from('courses').insert([payload]);
    }
    setIsModalOpen(false);
    setEditingCourse(null);
    setForm({ name: '', description: '', status: 'active', image: null });
    setUploading(false);
    // Refresh
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ name: course.name, description: course.description, status: course.status, image: null });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id);
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
  };

  // Filtered courses
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-16">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Management</CardTitle>
          <Button className="admin-button-primary flex items-center gap-2" onClick={() => { setIsModalOpen(true); setEditingCourse(null); setForm({ name: '', description: '', status: 'active', image: null }); }}>
            <Plus className="w-4 h-4" /> Add New Course
          </Button>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-4 w-full md:w-1/3" />
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">No courses found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Image</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 px-4">
                        <img src={c.image_url || PLACEHOLDER} alt={c.name} className="w-20 h-16 object-cover rounded border max-w-full h-auto" />
                      </td>
                      <td className="py-2 px-4">{c.name}</td>
                      <td className="py-2 px-4">{c.description}</td>
                      <td className="py-2 px-4">{c.status}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="admin-input w-full" required />
              <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="admin-input w-full" required />
              <select name="status" value={form.status} onChange={handleChange} className="admin-input w-full">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Input name="image" type="file" accept="image/*" onChange={handleChange} className="admin-input w-full" />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setEditingCourse(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="admin-button-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editingCourse ? 'Update' : 'Add')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;