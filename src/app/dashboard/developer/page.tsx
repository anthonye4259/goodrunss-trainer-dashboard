"use client"

/**
 * Developer Dashboard - API Keys Management
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Key, Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  description?: string;
  environment: string;
  scopes: string[];
  rateLimitPerMinute: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export default function DeveloperPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('sandbox');
  const [selectedScopes, setSelectedScopes] = useState(['read:bookings', 'write:bookings']);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/developer/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.data);
      }
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your API key',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          environment,
          scopes: selectedScopes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKeyValue(data.data.key);
        setShowNewKey(true);
        
        // Reset form
        setName('');
        setDescription('');
        setSelectedScopes(['read:bookings', 'write:bookings']);
        
        // Refresh keys list
        fetchKeys();
        
        toast({
          title: 'API Key Created',
          description: 'Save this key now - you won\'t see it again!',
        });
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create API key',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/keys?id=${keyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'API Key Revoked',
          description: 'The API key has been revoked successfully',
        });
        fetchKeys();
      } else {
        throw new Error('Failed to revoke key');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const availableScopes = [
    { value: 'read:bookings', label: 'Read Bookings' },
    { value: 'write:bookings', label: 'Write Bookings' },
    { value: 'read:trainers', label: 'Read Trainers' },
    { value: 'read:facilities', label: 'Read Facilities' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-1">
          Manage API keys for integrating with GoodRunss
        </p>
      </div>

      {/* New Key Alert */}
      {showNewKey && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Key className="h-5 w-5" />
              API Key Created!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              Save this key now - you won't see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={newKeyValue}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(newKeyValue)}
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setShowNewKey(false)}
            >
              I've saved it
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New API Key
          </CardTitle>
          <CardDescription>
            Generate a new API key for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableScopes.map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.value)}
                    onChange={() => toggleScope(scope.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{scope.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={createKey} disabled={creating || !name.trim()}>
            {creating ? 'Creating...' : 'Create API Key'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Keys */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>
        {keys.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No API keys yet. Create one above to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <Card key={key.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{key.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            key.environment === 'production'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          {key.environment}
                        </span>
                        {!key.isActive && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                            Revoked
                          </span>
                        )}
                      </div>
                      {key.description && (
                        <p className="text-sm text-muted-foreground">
                          {key.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {key.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key.replace('••••••••', ''))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                        {key.lastUsedAt && (
                          <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                        )}
                        <span>Rate limit: {key.rateLimitPerMinute}/min</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {key.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                    {key.isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use your API keys to integrate with GoodRunss:
          </p>
          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`curl -X GET https://goodrunss.com/api/v1/bookings \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
          </pre>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/openapi.json" target="_blank">View OpenAPI Spec</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/docs/api" target="_blank">Full Documentation</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

