import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const TestSupabase = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Simple select
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

      if (error) {
        console.error('Error:', error);
        setResult({ success: false, error: error.message });
      } else {
        console.log('Success:', data);
        setResult({ success: true, data });
      }
    } catch (err) {
      console.error('Exception:', err);
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    setLoading(true);
    try {
      console.log('Testing simple insert with direct REST API...');
      
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      const testData = {
        user_id: null,
        respuestas: { test: 'simple test' },
        scoring: { test: 'simple scoring' },
        arquetipo: 'TEST',
        urgencia_puntos: 50,
        madurez_puntos: 50,
        capacidad_puntos: 50,
      };

      console.log('Making direct fetch to:', `${supabaseUrl}/rest/v1/diagnosticos`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/diagnosticos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Insert Success via REST:', data);
      setResult({ success: true, data, method: 'Direct REST API' });
    } catch (err) {
      console.error('Exception:', err);
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Supabase Connection</h1>
        
        <div className="space-y-4 mb-8">
          <Button onClick={testConnection} disabled={loading}>
            Test Select (Read Users)
          </Button>
          
          <Button onClick={testInsert} disabled={loading} className="ml-4">
            Test Insert (Create Diagnostico)
          </Button>
        </div>

        {loading && <p>Loading...</p>}

        {result && (
          <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="font-bold mb-2">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSupabase;
