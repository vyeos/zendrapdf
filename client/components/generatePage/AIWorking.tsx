'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LumaSpin from '../21st/LumaSpin'
import Link from 'next/link'

interface AIWorkingProps {
  prompt: string
  fileName: string
  status?: 'working' | 'success' | 'error'
  progress?: number
  jobStatus?: string
}

const AIWorking: React.FC<AIWorkingProps> = ({
  prompt,
  fileName,
  status = 'working',
  progress = 5,
  jobStatus = 'queued',
}) => {
  const [showPrompt, setShowPrompt] = useState(false)

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

  const normalizedProgress = Math.max(5, Math.min(progress, 100));
  const stages = [
    { label: "Queued", threshold: 5 },
    { label: "Creating content", threshold: 25 },
    { label: "Designing document", threshold: 65 },
    { label: "Finalizing PDF", threshold: 90 },
  ];

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
                {status === 'working' && (
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
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {jobStatus === "queued" ? "Waiting for a generation worker" : "Your document is being prepared in the background"}
              </p>
            </div>

            {/* Asynchronous Event Steps */}
            {status === 'working' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 space-y-4 bg-muted/20 p-4 rounded-lg border border-border/50 text-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Generation progress</span><span>{Math.round(normalizedProgress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(normalizedProgress)}>
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${normalizedProgress}%` }} />
                  </div>
                </div>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {stages.map((stage) => (
                    <li key={stage.label} className={normalizedProgress >= stage.threshold ? "text-foreground" : "text-muted-foreground"}>
                      <span aria-hidden="true" className={`mr-2 inline-block size-2 rounded-full ${normalizedProgress >= stage.threshold ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {stage.label}
                    </li>
                  ))}
                </ol>
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
                  {showPrompt ? "Hide Prompt" : "View Prompt"}
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
                      <div className="text-xs font-semibold mb-2">Your Prompt</div>
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
                <div className="text-center text-sm text-muted-foreground">
                  This usually takes one to three minutes. You can safely navigate away and follow progress from the dashboard.
                </div>
                <div className="flex justify-center">
                  <Link href="/dashboard">
                    <Button variant="secondary">
                      Go to Dashboard & View Progress
                    </Button>
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
                  Generate Another
                </Button>
              )}

              {status === 'error' && (
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Again
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
              <div className="text-xs text-muted-foreground">
                {status === 'working'
                  ? 'Your PDF will open automatically when ready'
                  : status === 'success'
                    ? 'Ready to edit'
                    : 'Please try again or check your credits'
                }
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AIWorking
