/**
 * Editor settings component for configuring the enhanced SQL editor
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings2, Type, Eye, Zap, Palette } from 'lucide-react';
import type { EditorSettings } from '../../types/editor';
import { DEFAULT_EDITOR_SETTINGS } from '../../utils/editorConfig';

export interface EditorSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  className?: string;
}

export function EditorSettingsDropdown({
  settings,
  onSettingsChange,
  className
}: EditorSettingsProps) {
  const handleBooleanSettingChange = (key: keyof EditorSettings, value: boolean) => {
    onSettingsChange({ [key]: value });
  };

  const handleNumberSettingChange = (key: keyof EditorSettings, value: number) => {
    onSettingsChange({ [key]: value });
  };

  const resetToDefaults = () => {
    onSettingsChange(DEFAULT_EDITOR_SETTINGS);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings2 className="h-4 w-4 mr-2" />
          Editor Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center">
          <Settings2 className="h-4 w-4 mr-2" />
          Editor Configuration
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Display Settings */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          <Eye className="h-3 w-3 mr-1 inline" />
          Display
        </DropdownMenuLabel>

        <DropdownMenuCheckboxItem
          checked={settings.lineNumbers}
          onCheckedChange={(checked) => handleBooleanSettingChange('lineNumbers', checked)}
        >
          <div className="flex flex-col">
            <span>Line numbers</span>
            <span className="text-xs text-muted-foreground">Show line numbers in gutter</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={settings.minimap}
          onCheckedChange={(checked) => handleBooleanSettingChange('minimap', checked)}
        >
          <div className="flex flex-col">
            <span>Minimap</span>
            <span className="text-xs text-muted-foreground">Show code overview</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={settings.wordWrap}
          onCheckedChange={(checked) => handleBooleanSettingChange('wordWrap', checked)}
        >
          <div className="flex flex-col">
            <span>Word wrap</span>
            <span className="text-xs text-muted-foreground">Wrap long lines</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {/* Font Settings */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          <Type className="h-3 w-3 mr-1 inline" />
          Typography
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={settings.fontSize.toString()}
          onValueChange={(value) => handleNumberSettingChange('fontSize', parseInt(value))}
        >
          <DropdownMenuRadioItem value="12">
            <div className="flex flex-col">
              <span>Small (12px)</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="14">
            <div className="flex flex-col">
              <span>Medium (14px)</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="16">
            <div className="flex flex-col">
              <span>Large (16px)</span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="18">
            <div className="flex flex-col">
              <span>Extra Large (18px)</span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuRadioGroup
          value={settings.tabSize.toString()}
          onValueChange={(value) => handleNumberSettingChange('tabSize', parseInt(value))}
        >
          <DropdownMenuRadioItem value="2">
            Tab size: 2 spaces
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="4">
            Tab size: 4 spaces
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="8">
            Tab size: 8 spaces
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Behavior Settings */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          <Zap className="h-3 w-3 mr-1 inline" />
          Behavior
        </DropdownMenuLabel>

        <DropdownMenuCheckboxItem
          checked={settings.autoComplete}
          onCheckedChange={(checked) => handleBooleanSettingChange('autoComplete', checked)}
        >
          <div className="flex flex-col">
            <span>Auto completion</span>
            <span className="text-xs text-muted-foreground">Show suggestions while typing</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={settings.formatOnType}
          onCheckedChange={(checked) => handleBooleanSettingChange('formatOnType', checked)}
        >
          <div className="flex flex-col">
            <span>Format on type</span>
            <span className="text-xs text-muted-foreground">Auto-format as you type</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        {/* SQL Features */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          <Palette className="h-3 w-3 mr-1 inline" />
          SQL Features
        </DropdownMenuLabel>

        <DropdownMenuCheckboxItem
          checked={settings.syntaxHighlighting}
          onCheckedChange={(checked) => handleBooleanSettingChange('syntaxHighlighting', checked)}
        >
          <div className="flex flex-col">
            <span>Syntax highlighting</span>
            <span className="text-xs text-muted-foreground">Color-code SQL keywords</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={settings.errorHighlighting}
          onCheckedChange={(checked) => handleBooleanSettingChange('errorHighlighting', checked)}
        >
          <div className="flex flex-col">
            <span>Error highlighting</span>
            <span className="text-xs text-muted-foreground">Show syntax errors inline</span>
          </div>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={resetToDefaults}>
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}