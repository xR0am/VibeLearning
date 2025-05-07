import React, { useState } from 'react';
import { CodeLoader } from '@/components/ui/code-loader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoaderDemo() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [variant, setVariant] = useState<'spinner' | 'pulse' | 'code' | 'terminal'>('code');
  const [showText, setShowText] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Code Loader Showcase</h1>
          <p className="text-muted-foreground mb-8">
            Explore different variants of our coding-themed loading spinners with micro-interactions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] pt-10 pb-16">
                <CodeLoader 
                  size={size} 
                  variant={variant} 
                  text={loadingText} 
                  showText={showText}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="variant">Variant</Label>
                  <Select 
                    value={variant} 
                    onValueChange={(value) => setVariant(value as any)}>
                    <SelectTrigger id="variant">
                      <SelectValue placeholder="Select a variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spinner">Spinner</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="terminal">Terminal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select 
                    value={size} 
                    onValueChange={(value) => setSize(value as any)}>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loadingText">Loading Text</Label>
                  <Input 
                    id="loadingText" 
                    value={loadingText} 
                    onChange={(e) => setLoadingText(e.target.value)}
                    placeholder="Enter loading text" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showText">Show Text</Label>
                  <Switch 
                    id="showText" 
                    checked={showText} 
                    onCheckedChange={setShowText}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Usage Example</h3>
                  <div className="rounded-md bg-slate-900 p-4 text-sm text-slate-50 overflow-auto">
                    <pre>{`<CodeLoader 
  size="${size}" 
  variant="${variant}" 
  text="${loadingText}" 
  showText={${showText}} 
/>`}</pre>
                  </div>
                </div>

                <Button 
                  onClick={handleStartLoading} 
                  disabled={isLoading} 
                  className="w-full mt-4"
                >
                  {isLoading ? "Loading..." : "Test with Delay (3s)"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* All variants showcase */}
          <h2 className="text-2xl font-bold mt-12 mb-6">All Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(['spinner', 'pulse', 'code', 'terminal'] as const).map((v) => (
              <Card key={v} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">{v.charAt(0).toUpperCase() + v.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex items-center justify-center min-h-[150px]">
                  <CodeLoader variant={v} size="md" showText={false} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All sizes showcase */}
          <h2 className="text-2xl font-bold mt-12 mb-6">All Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <Card key={s} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">
                    {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex items-center justify-center min-h-[150px]">
                  <CodeLoader variant="code" size={s} showText={false} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}