import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { Database, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const TestTables: React.FC = () => {
  const [results, setResults] = useState<Record<string, { exists: boolean; error: string | null; data: unknown }>>({});
  const [loading, setLoading] = useState(false);

  const testTables = async () => {
    setLoading(true);
    const tables = ['students', 'functions', 'participants', 'instructors', 'courses', 'staff', 'announcements', 'gallery', 'classes', 'settings'];
    const results: Record<string, { exists: boolean; error: string | null; data: unknown }> = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = {
          exists: !error,
          error: error?.message || null,
          data: data
        };
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          data: null
        };
      }
    }

    setResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testTables();
  }, []);

  const getTableIcon = (tableName: string) => {
    const icons: Record<string, string> = {
      students: '👥',
      functions: '🎉',
      participants: '👤',
      instructors: '👨‍🏫',
      courses: '📚',
      staff: '👨‍💼',
      announcements: '📢',
      gallery: '🖼️',
      classes: '🏫',
      settings: '⚙️'
    };
    return icons[tableName] || '📋';
  };

  const getStatusColor = (exists: boolean) => {
    return exists ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const successfulTables = Object.entries(results).filter(([, result]) => result.exists).length;
  const totalTables = Object.keys(results).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Database Health Check
              </h1>
              <p className="text-gray-400 mt-1">
                Monitor and verify database table connectivity
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Tables</p>
                  <p className="text-2xl font-bold text-white">{totalTables}</p>
                </div>
                <Database className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Connected</p>
                  <p className="text-2xl font-bold text-green-400">{successfulTables}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{totalTables - successfulTables}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6 flex justify-center">
        <Button 
          onClick={testTables} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Testing Database...
            </>
          ) : (
            <>
              <Database className="w-5 h-5 mr-2" />
              Refresh Database Test
            </>
          )}
        </Button>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(results).map(([tableName, result]) => (
          <Card key={tableName} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTableIcon(tableName)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {tableName}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(result.exists)} border`}
                    >
                      {result.exists ? 'Connected' : 'Failed'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5">
                  {result.exists ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {result.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 text-sm font-medium">Error</p>
                        <p className="text-red-300 text-xs mt-1">{result.error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.data && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 text-sm font-medium">Sample Data</p>
                        <p className="text-green-300 text-xs mt-1 font-mono">
                          {Array.isArray(result.data) ? `${result.data.length} records` : '1 record'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!result.error && !result.data && result.exists && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Database className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-400 text-sm font-medium">Status</p>
                        <p className="text-blue-300 text-xs mt-1">Table accessible</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(results).length === 0 && !loading && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Test Results</h3>
          <p className="text-gray-500">Click the button above to test your database tables</p>
        </div>
      )}
    </div>
  );
};

export default TestTables; 