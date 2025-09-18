/**
 * Editor status bar component showing validation status and statistics
 */

import React from 'react';
import * as monaco from 'monaco-editor';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorStatusBarProps {
  errors?: monaco.editor.IMarkerData[];
  lineCount?: number;
  characterCount?: number;
  engine?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  schemaLastUpdated?: Date;
  className?: string;
}

export function EditorStatusBar({
  errors = [],
  lineCount = 0,
  characterCount = 0,
  engine = 'SQL',
  connectionStatus = 'disconnected',
  schemaLastUpdated,
  className
}: EditorStatusBarProps) {
  const errorCount = errors.filter(e => e.severity === monaco.MarkerSeverity.Error).length;
  const warningCount = errors.filter(e => e.severity === monaco.MarkerSeverity.Warning).length;
  const infoCount = errors.filter(e => e.severity === monaco.MarkerSeverity.Info).length;

  const getStatusIcon = () => {
    if (errorCount > 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (warningCount > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (infoCount > 0) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'disconnected':
      default:
        return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
      default:
        return 'Not connected';
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours}h ago`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      }
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 text-xs text-gray-600 bg-gray-50 border-t border-gray-200',
        className
      )}
    >
      {/* Left side - Validation status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>
            {errorCount > 0 && (
              <span className="text-red-600 font-medium">
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className={cn('text-yellow-600', errorCount > 0 && 'ml-2')}>
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
            {infoCount > 0 && (
              <span className={cn('text-blue-600', (errorCount > 0 || warningCount > 0) && 'ml-2')}>
                {infoCount} info
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && infoCount === 0 && (
              <span className="text-green-600">No issues</span>
            )}
          </span>
        </div>

        {/* Document stats */}
        <div className="flex items-center space-x-3 text-gray-500">
          <span>Lines: {lineCount}</span>
          <span>Characters: {characterCount}</span>
        </div>
      </div>

      {/* Right side - Connection and engine info */}
      <div className="flex items-center space-x-4">
        {schemaLastUpdated && (
          <span className="text-gray-500">
            Schema: {formatLastUpdated(schemaLastUpdated)}
          </span>
        )}
        
        <div className="flex items-center space-x-2">
          <div className={cn('w-2 h-2 rounded-full', {
            'bg-green-500': connectionStatus === 'connected',
            'bg-yellow-500': connectionStatus === 'connecting',
            'bg-gray-400': connectionStatus === 'disconnected'
          })} />
          <span className={getConnectionStatusColor()}>
            {getConnectionStatusText()}
          </span>
        </div>

        <span className="text-gray-500 font-medium">
          {engine}
        </span>
      </div>
    </div>
  );
}