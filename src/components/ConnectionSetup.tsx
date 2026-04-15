import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Settings, RefreshCw } from 'lucide-react';

const ConnectionSetup = ({ onClose }: { onClose?: () => void }) => {
  const { connection, connectToTally } = useApp();
  const [host, setHost] = useState(connection.host);
  const [port, setPort] = useState(String(connection.port));
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    const ok = await connectToTally(host, parseInt(port));
    setResult(ok ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> Tally Connection
        </CardTitle>
        <CardDescription>Connect to Tally Prime running on your local machine</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Host</label>
          <Input value={host} onChange={e => setHost(e.target.value)} placeholder="localhost" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Port</label>
          <Input value={port} onChange={e => setPort(e.target.value)} placeholder="9000" type="number" />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={testing} className="flex-1 gap-1">
            {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          {onClose && <Button variant="outline" onClick={onClose}>Close</Button>}
        </div>

        {result === 'success' && (
          <Badge className="w-full justify-center py-2 bg-green-100 text-green-800 hover:bg-green-100">
            ✓ Connected to Tally Prime
          </Badge>
        )}
        {result === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
            <p className="font-medium">Connection failed</p>
            <p className="text-xs mt-1">Make sure Tally Prime is running with ODBC/XML server enabled on port {port}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Using demo data while disconnected. Connect to Tally Prime to sync real data.
        </p>
      </CardContent>
    </Card>
  );
};

export default ConnectionSetup;
