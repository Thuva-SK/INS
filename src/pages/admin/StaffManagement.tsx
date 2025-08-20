import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', status: 'active' });

  // Fetch staff from Supabase
  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (!error && data) setStaff(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
    // Optionally, subscribe to real-time changes
    const channel = supabase.channel('staff-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, fetchStaff)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or edit staff
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status };
    if (editingStaff) {
      await supabase.from('staff').update(payload).eq('id', editingStaff.id);
    } else {
      await supabase.from('staff').insert([payload]);
    }
    setModalOpen(false);
    setEditingStaff(null);
    setForm({ name: '', email: '', phone: '', role: '', status: 'active' });
    fetchStaff();
  };

  // Edit button
  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setForm({ name: staff.name, email: staff.email, phone: staff.phone, role: staff.role, status: staff.status });
    setModalOpen(true);
  };

  // Delete button
  const handleDelete = async (id: string) => {
    await supabase.from('staff').delete().eq('id', id);
    fetchStaff();
  };

  return (
    <div className="space-y-6 pt-16">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Management</CardTitle>
          <Button className="admin-button-primary flex items-center gap-2" onClick={() => { setModalOpen(true); setEditingStaff(null); setForm({ name: '', email: '', phone: '', role: '', status: 'active' }); }}>
            <Plus className="w-4 h-4" /> Add New Staff
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <Users className="w-12 h-12 text-primary mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No staff members found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Role</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="py-2 px-4">{s.name}</td>
                      <td className="py-2 px-4">{s.email}</td>
                      <td className="py-2 px-4">{s.role}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(s)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Staff */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="admin-input w-full" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="admin-input w-full" required type="email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="admin-input w-full" required />
              <input name="role" value={form.role} onChange={handleChange} placeholder="Role" className="admin-input w-full" required />
              <select name="status" value={form.status} onChange={handleChange} className="admin-input w-full">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingStaff(null); }}>Cancel</Button>
                <Button type="submit" className="admin-button-primary">{editingStaff ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement; 