'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Plus,
  RotateCcw,
  File,
  ArrowDownLeft,
  Layers,
  LayoutDashboard,
  Sparkles
} from 'lucide-react'
import LumaSpin from '../21st/LumaSpin'
import Link from 'next/link'

interface AIWorkingProps {
  prompt: string
  fileName: string
  status?: 'working' | 'success' | 'error'
}

const AIWorking: React.FC<AIWorkingProps> = ({
  prompt,
  fileName,
  status = 'working',
}) => {
  const [showPrompt, setShowPrompt] = useState(false)

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-primary" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />
      default:
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'PDF Generated Successfully!'
      case 'error':
        return 'Generation Failed'
      default:
        return `Generating "${fileName}" in background...`
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-primary'
      case 'error':
        return 'text-destructive'
      default:
        return 'text-primary'
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="border-2 border-secondary rounded-xl bg-card/50 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center mb-4"
              >
                {status !== 'working' ? (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {getStatusIcon()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center my-2">
                    <LumaSpin />
                  </div>
                )}
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-2xl font-bold ${getStatusColor()} mb-2`}
              >
                {getStatusText()}
              </motion.h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your task is queued and processing asynchronously via BullMQ & Redis.
              </p>
            </div>

            {/* Asynchronous Event Steps */}
            {status === 'working' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 space-y-2.5 bg-muted/20 p-4 rounded-lg border border-border/50 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5 text-foreground font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Enqueued to Background Job Worker</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span>Executing Multi-layer AI Prompt & Context Refinement</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <span>Injecting Inline CSS Typography & HTML Rendering</span>
                </div>
              </motion.div>
            )}

            {/* Prompt Visibility Toggle */}
            {status !== 'success' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="my-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="w-full text-xs"
                >
                  {showPrompt ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                      Hide Prompt
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Prompt
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Prompt Display */}
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <Card className="bg-muted/30 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold">Your Prompt</span>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {prompt}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background Navigation Notice */}
            {status === "working" && (
              <div className="space-y-4 my-6">
                <div className="text-center text-xs text-muted-foreground">
                  You can safely navigate away! The document will process in the background.
                </div>
                <div className="flex justify-center">
                  <Link href="/dashboard">
                    <Button variant="secondary" className="gap-2 text-xs">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard & View Progress
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link href="/pdf-to-word" className="hover:scale-105 transition-transform flex gap-1.5 items-center text-blue-600 dark:text-blue-400 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                    <File className="h-4 w-4" />
                    <span>PDF to Word</span>
                  </Link>
                  <Link href="/compress-pdf" className="hover:scale-105 transition-transform flex gap-1.5 items-center text-red-600 dark:text-red-400 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>Compress</span>
                  </Link>
                  <Link href="/merge-pdf" className="hover:scale-105 transition-transform flex gap-1.5 items-center text-purple-600 dark:text-purple-400 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                    <Layers className="h-4 w-4" />
                    <span>Merge</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              {status === 'success' && (
                <Button
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Generate Another
                </Button>
              )}

              {status === 'error' && (
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Try Again
                </Button>
              )}
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {status === 'working'
                    ? 'Your PDF will open automatically when ready'
                    : status === 'success'
                      ? 'Ready to edit'
                      : 'Please try again or check your credits'
                  }
                </span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AIWorking
