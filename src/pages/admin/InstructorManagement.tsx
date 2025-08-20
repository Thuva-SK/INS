import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: string;
  created_at: string;
}

const InstructorManagement: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', status: 'active' });
  const [loading, setLoading] = useState(true);

  // Fetch instructors from Supabase
  const fetchInstructors = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('instructors').select('*').order('created_at', { ascending: false });
    if (!error && data) setInstructors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInstructors();
    const channel = supabase.channel('instructors-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instructors' }, fetchInstructors)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  // Filtered instructors
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or edit instructor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, phone: form.phone, department: form.department, status: form.status };
    if (editingInstructor) {
      await supabase.from('instructors').update(payload).eq('id', editingInstructor.id);
    } else {
      await supabase.from('instructors').insert([payload]);
    }
    setIsModalOpen(false);
    setEditingInstructor(null);
    setForm({ name: '', email: '', phone: '', department: '', status: 'active' });
    fetchInstructors();
  };

  // Edit button
  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setForm({ name: instructor.name, email: instructor.email, phone: instructor.phone, department: instructor.department, status: instructor.status });
    setIsModalOpen(true);
  };

  // Delete button
  const handleDelete = async (id: string) => {
    await supabase.from('instructors').delete().eq('id', id);
    fetchInstructors();
  };

  return (
    <div className="space-y-6 pt-16">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Instructor Management</CardTitle>
          <Button className="admin-button-primary flex items-center gap-2" onClick={() => { setIsModalOpen(true); setEditingInstructor(null); setForm({ name: '', email: '', phone: '', department: '', status: 'active' }); }}>
            <Plus className="w-4 h-4" /> Add New Instructor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input placeholder="Search instructors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredInstructors.length === 0 ? (
            <div className="text-center py-8">No instructors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Department</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td className="py-2 px-4">{i.name}</td>
                      <td className="py-2 px-4">{i.email}</td>
                      <td className="py-2 px-4">{i.department}</td>
                      <td className="py-2 px-4">
                        <Badge variant={i.status === 'active' ? 'default' : 'secondary'}>{i.status}</Badge>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(i)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(i.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Instructor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="admin-input w-full" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="admin-input w-full" required type="email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="admin-input w-full" required />
              <input name="department" value={form.department} onChange={handleChange} placeholder="Department" className="admin-input w-full" required />
              <select name="status" value={form.status} onChange={handleChange} className="admin-input w-full">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setEditingInstructor(null); }}>Cancel</Button>
                <Button type="submit" className="admin-button-primary">{editingInstructor ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagement;