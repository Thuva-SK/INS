import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';

const PLACEHOLDER = 'https://via.placeholder.com/80x60?text=No+Image';

interface Class {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
}

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: null as File | null });
  const [uploading, setUploading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (!error && data) setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
    const channel = supabase.channel('classes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, fetchClasses)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
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
      const filePath = `class/${Date.now()}-${form.image.name}`;
      const { data: storageData, error: storageError } = await supabase.storage.from('class-image').upload(filePath, form.image, { upsert: true });
      if (!storageError && storageData) {
        image_url = supabase.storage.from('class-image').getPublicUrl(filePath).data.publicUrl;
      }
    }
    const payload = { name: form.name, description: form.description, image_url: image_url || undefined };
    if (editingClass) {
      await supabase.from('classes').update(payload).eq('id', editingClass.id);
    } else {
      await supabase.from('classes').insert([payload]);
    }
    setModalOpen(false);
    setEditingClass(null);
    setForm({ name: '', description: '', image: null });
    setUploading(false);
    fetchClasses();
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setForm({ name: cls.name, description: cls.description || '', image: null });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('classes').delete().eq('id', id);
    fetchClasses();
  };

  return (
    <div className="space-y-6 pt-16">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Class Management</CardTitle>
          <Button className="admin-button-primary flex items-center gap-2" onClick={() => { setModalOpen(true); setEditingClass(null); setForm({ name: '', description: '', image: null }); }}>
            <Plus className="w-4 h-4" /> Add New Class
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8">No classes found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Image</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b">
                      <td className="py-2 px-4">
                        <img src={cls.image_url || PLACEHOLDER} alt={cls.name} className="w-20 h-16 object-cover rounded border max-w-full h-auto" />
                      </td>
                      <td className="py-2 px-4">{cls.name}</td>
                      <td className="py-2 px-4">{cls.description}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(cls)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(cls.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Class */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="admin-input w-full" required />
              <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="admin-input w-full" />
              <Input name="image" type="file" accept="image/*" onChange={handleChange} className="admin-input w-full" />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingClass(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="admin-button-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editingClass ? 'Update' : 'Add')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement; 