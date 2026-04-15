import { useApp } from '@/contexts/AppContext';
import { Wifi, WifiOff, RefreshCw, ToggleLeft, ToggleRight, Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AppHeader = () => {
  const { mode, toggleMode, connection, syncState, selectedCompany } = useApp();

  return (
    <header className="border-b bg-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-primary">TallySync</h1>
        <Badge variant={connection.isConnected ? 'default' : 'destructive'} className="gap-1">
          {connection.isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {connection.isConnected ? 'Connected' : 'Offline'}
        </Badge>
        {selectedCompany && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {selectedCompany}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {syncState.pendingChanges > 0 && (
          <Badge variant="secondary">{syncState.pendingChanges} pending</Badge>
        )}
        {syncState.isSyncing && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}

        <Button variant="outline" size="sm" onClick={toggleMode} className="gap-1.5">
          {mode === 'easy' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
          {mode === 'easy' ? 'Easy Mode' : 'Tally Mode'}
          <kbd className="ml-1 text-[10px] text-muted-foreground bg-muted px-1 rounded">Ctrl+M</kbd>
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
