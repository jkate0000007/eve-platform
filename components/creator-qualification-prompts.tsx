"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Apple, Users, Crown, Sparkles, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CreatorQualificationPromptsProps {
  followerCount: number
}

export function CreatorQualificationPrompts({ followerCount }: CreatorQualificationPromptsProps) {
  const [currentPrompt, setCurrentPrompt] = useState<number>(0)
  const [showDialog, setShowDialog] = useState(false)
  
  const needsAppleGifts = followerCount < 100
  const needsSubscribeButton = followerCount < 1000

  // Create array of prompts to show
  const prompts = []
  if (needsAppleGifts) {
    prompts.push({
      type: 'apple-gifts',
      title: 'Unlock Apple Gifts 🍎',
      subtitle: 'Monetize Your Content',
      description: `You're ${100 - followerCount} followers away from unlocking Apple Gifts! This feature lets your fans send you virtual apples as a way to show appreciation and support your work.`,
      benefits: [
        'Direct fan support and appreciation',
        'Additional revenue stream',
        'Engage with your community'
      ],
      icon: Apple,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    })
  }
  
  if (needsSubscribeButton) {
    prompts.push({
      type: 'subscribe-button',
      title: 'Unlock Subscribe Button 👑',
      subtitle: 'Build Your Premium Community',
      description: `You're ${1000 - followerCount} followers away from unlocking the Subscribe Button! This powerful feature allows fans to subscribe to your exclusive content and become part of your premium community.`,
      benefits: [
        'Recurring monthly revenue',
        'Exclusive content creation',
        'Dedicated fan community'
      ],
      icon: Crown,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    })
  }

  // Show first prompt on mount if there are any
  useEffect(() => {
    if (prompts.length > 0) {
      setShowDialog(true)
    }
  }, [prompts.length])

  const handleNext = () => {
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1)
    } else {
      // All prompts shown, close dialog
      setShowDialog(false)
    }
  }

  const handleClose = () => {
    setShowDialog(false)
  }

  if (prompts.length === 0) {
    return null
  }

  const currentPromptData = prompts[currentPrompt]
  const IconComponent = currentPromptData.icon

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${currentPromptData.bgGradient} p-6 border-b ${currentPromptData.borderColor}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-gradient-to-r ${currentPromptData.gradient} shadow-lg`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-1">
                {currentPromptData.title}
              </DialogTitle>
              <p className="text-sm font-medium text-gray-600">
                {currentPromptData.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogDescription className="text-base text-white leading-relaxed mb-6">
            {currentPromptData.description}
          </DialogDescription>
          
          {/* Benefits section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              What you'll unlock:
            </h4>
            <div className="space-y-2">
              {currentPromptData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-white">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Progress section */}
          <div className={`bg-gradient-to-r ${currentPromptData.bgGradient} p-4 rounded-xl border ${currentPromptData.borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-semibold text-gray-900">Your Progress</span>
              </div>
              <span className="text-xs text-gray-700">
                {currentPrompt < prompts.length - 1 ? `${currentPrompt + 1} of ${prompts.length}` : 'Final step'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Current followers:</span>
                <span className="font-bold text-gray-900">{followerCount}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-600">Target:</span>
                <span className="font-bold text-gray-900 ml-1">
                  {currentPromptData.type === 'apple-gifts' ? '100' : '1,000'}
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentPromptData.gradient} transition-all duration-500 ease-out`}
                style={{ 
                  width: `${Math.min((followerCount / (currentPromptData.type === 'apple-gifts' ? 100 : 1000)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Skip All
            </Button>
            <Button 
              onClick={handleNext}
              className={`flex-1 bg-gradient-to-r ${currentPromptData.gradient} hover:opacity-90 text-white border-0 shadow-lg`}
            >
              {currentPrompt < prompts.length - 1 ? 'Next Feature' : 'Start Growing!'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 