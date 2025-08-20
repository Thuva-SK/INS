import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Camp {
  id: string;
  name: string;
  date: string;
  participants: number;
}

const KidsCamp: React.FC = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', participants: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch camps from Supabase
  useEffect(() => {
    const fetchCamps = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('kidscamp').select('*').order('date', { ascending: false });
      if (!error && data) setCamps(data);
      setLoading(false);
    };
    fetchCamps();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, date: form.date, participants: Number(form.participants) };
    const { data, error } = await supabase.from('kidscamp').insert([payload]).select();
    if (!error && data) setCamps([data[0], ...camps]);
    setForm({ name: '', date: '', participants: 0 });
    setIsModalOpen(false);
  };

  return (
    <div className="pt-16 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kids Camp</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Camp
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Camps List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : camps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No camps found. Add your first camp!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {camps.map((camp) => (
                    <tr key={camp.id} className="border-b">
                      <td className="py-2 px-4">{camp.name}</td>
                      <td className="py-2 px-4">{camp.date}</td>
                      <td className="py-2 px-4">{camp.participants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add Camp Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Camp</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Camp Name"
                required
              />
              <Input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
              <Input
                name="participants"
                type="number"
                min={0}
                value={form.participants}
                onChange={handleChange}
                placeholder="Participants Count"
                required
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="admin-button-primary">
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsCamp; 