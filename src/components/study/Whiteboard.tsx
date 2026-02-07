import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash2, PenTool } from 'lucide-react';
import { toast } from 'sonner';

interface WhiteboardProps {
  weekId?: string;
}

export function Whiteboard({ weekId }: WhiteboardProps) {
  const [Excalidraw, setExcalidraw] = useState<any>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Excalidraw to avoid SSR issues
    import('@excalidraw/excalidraw').then((module) => {
      setExcalidraw(() => module.Excalidraw);
    });

    // Load saved data from localStorage
    const storageKey = weekId ? `whiteboard-${weekId}` : 'whiteboard-general';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setInitialData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved whiteboard data');
      }
    }
  }, [weekId]);

  const handleSave = () => {
    if (!excalidrawAPI) return;
    
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    
    const storageKey = weekId ? `whiteboard-${weekId}` : 'whiteboard-general';
    const data = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        currentItemFontFamily: appState.currentItemFontFamily,
      }
    };
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    toast.success('Notes saved');
  };

  const handleClear = () => {
    if (!excalidrawAPI) return;
    excalidrawAPI.resetScene();
    
    const storageKey = weekId ? `whiteboard-${weekId}` : 'whiteboard-general';
    localStorage.removeItem(storageKey);
    toast.success('Canvas cleared');
  };

  if (!Excalidraw) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PenTool className="h-5 w-5 animate-pulse" />
            Loading whiteboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Visual Notes
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] w-full border-t">
          <Excalidraw
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
            initialData={initialData}
            theme="light"
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
                export: false,
                saveAsImage: false,
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
