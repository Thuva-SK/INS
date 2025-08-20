import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Users, Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Function {
  id: string;
  name: string;
  date: string;
  created_at: string;
}

interface Participant {
  id: string;
  function_id: string;
  name: string;
  phone: string;
  attended: boolean;
  paid_for_post: boolean;
  created_at: string;
}

const FunctionManagement: React.FC = () => {
  const [functions, setFunctions] = useState<Function[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState<string | null>(null);
  const [addStudentModal, setAddStudentModal] = useState<{ functionId: string } | null>(null);
  const [editFunctionModal, setEditFunctionModal] = useState<{ id: string, name: string, date: string } | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', phone: '' });
  const [newFunction, setNewFunction] = useState({ name: '', date: '' });
  const [addFunctionModal, setAddFunctionModal] = useState(false);

  // Fetch functions from Supabase
  const fetchFunctions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('functions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFunctions(data);
    }
    setLoading(false);
  };

  // Fetch participants from Supabase
  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setParticipants(data);
    }
  };

  useEffect(() => {
    fetchFunctions();
    fetchParticipants();

    // Real-time subscriptions
    const functionsChannel = supabase.channel('functions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'functions' }, fetchFunctions)
      .subscribe();

    const participantsChannel = supabase.channel('participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchParticipants)
      .subscribe();

    return () => {
      functionsChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, []);

  // Get participants for a specific function
  const getParticipantsForFunction = (functionId: string) => {
    return participants.filter(p => p.function_id === functionId);
  };

  // Add new function
  const handleAddFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunction.name || !newFunction.date) return;
    const payload = { name: newFunction.name, date: newFunction.date };
    const { error } = await supabase
      .from('functions')
      .insert([payload]);
    if (!error) {
      setAddFunctionModal(false);
      setNewFunction({ name: '', date: '' });
    }
  };

  // Edit function
  const handleEditFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFunctionModal) return;
    const payload = { name: editFunctionModal.name, date: editFunctionModal.date };
    const { error } = await supabase
      .from('functions')
      .update(payload)
      .eq('id', editFunctionModal.id);
    if (!error) {
      setEditFunctionModal(null);
    }
  };

  // Delete function
  const handleDeleteFunction = async (id: string) => {
    // First delete all participants for this function
    await supabase.from('participants').delete().eq('function_id', id);
    // Then delete the function
    await supabase.from('functions').delete().eq('id', id);
  };

  // Add new participant
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStudentModal || !newStudent.name || !newStudent.phone) return;

    const { error } = await supabase
      .from('participants')
      .insert([{
        function_id: addStudentModal.functionId,
        name: newStudent.name,
        phone: newStudent.phone,
        attended: false,
        paid_for_post: false
      }]);

    if (!error) {
      setAddStudentModal(null);
      setNewStudent({ name: '', phone: '' });
    }
  };

  // Toggle attended status
  const handleToggleAttended = async (participantId: string, currentAttended: boolean) => {
    await supabase
      .from('participants')
      .update({ attended: !currentAttended })
      .eq('id', participantId);
  };

  // Toggle paid for post status
  const handleTogglePaidForPost = async (participantId: string, currentPaid: boolean) => {
    await supabase
      .from('participants')
      .update({ paid_for_post: !currentPaid })
      .eq('id', participantId);
  };

  // Delete participant
  const handleDeleteParticipant = async (participantId: string) => {
    await supabase.from('participants').delete().eq('id', participantId);
  };

  return (
    <div className="pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Function Management</h1>
          <br></br>
          <br></br>
        </div>
        <Button 
          onClick={() => setAddFunctionModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Function
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Functions List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : functions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No functions found. Add your first function!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold">Function Name</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Participants</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {functions.map(fn => {
                    const functionParticipants = getParticipantsForFunction(fn.id);
                    const attendedCount = functionParticipants.filter(p => p.attended).length;
                    const totalCount = functionParticipants.length;
                    
                    return (
                      <tr key={fn.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 font-medium">{fn.name}</td>
                        <td className="py-3 px-4">{new Date(fn.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {attendedCount}/{totalCount} attended
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowParticipants(fn.id)}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Participants
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditFunctionModal({ 
                                id: fn.id, 
                                name: fn.name, 
                                date: fn.date 
                              })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteFunction(fn.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Participants</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {functions.find(f => f.id === showParticipants)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setAddStudentModal({ functionId: showParticipants })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowParticipants(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Phone</th>
                    <th className="py-3 px-4 font-semibold">Attended</th>
                    <th className="py-3 px-4 font-semibold">Paid for Post</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getParticipantsForFunction(showParticipants).map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4">{p.phone}</td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          variant={p.attended ? 'default' : 'outline'}
                          onClick={() => handleToggleAttended(p.id, p.attended)}
                        >
                          {p.attended ? 'Yes' : 'No'}
                        </Button>
                      </td>
                      <td className="py-3 px-4">
                        {!p.attended ? (
                          <Button 
                            size="sm" 
                            variant={p.paid_for_post ? 'default' : 'outline'}
                            onClick={() => handleTogglePaidForPost(p.id, p.paid_for_post)}
                          >
                            {p.paid_for_post ? 'Paid' : 'Mark as Paid'}
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {!p.attended && p.paid_for_post ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Award/Certificate will be posted
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Function Modal */}
      {addFunctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Function</h2>
            <form onSubmit={handleAddFunction} className="space-y-4">
              <div>
                <Label htmlFor="functionName">Function Name</Label>
                <Input
                  id="functionName"
                  placeholder="Enter function name"
                  value={newFunction.name}
                  onChange={e => setNewFunction({ ...newFunction, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="functionDate">Date</Label>
                <Input
                  id="functionDate"
                  type="date"
                  value={newFunction.date}
                  onChange={e => setNewFunction({ ...newFunction, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddFunctionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Add Function
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {addStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Student</h2>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <div>
                <Label htmlFor="studentName">Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentPhone">Phone Number</Label>
                <Input
                  id="studentPhone"
                  placeholder="Enter phone number"
                  value={newStudent.phone}
                  onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddStudentModal(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Function Modal */}
      {editFunctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Function</h2>
            <form onSubmit={handleEditFunction} className="space-y-4">
              <div>
                <Label htmlFor="editFunctionName">Function Name</Label>
                <Input
                  id="editFunctionName"
                  placeholder="Enter function name"
                  value={editFunctionModal.name}
                  onChange={e => setEditFunctionModal({ ...editFunctionModal, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editFunctionDate">Date</Label>
                <Input
                  id="editFunctionDate"
                  type="date"
                  value={editFunctionModal.date}
                  onChange={e => setEditFunctionModal({ ...editFunctionModal, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditFunctionModal(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionManagement; 