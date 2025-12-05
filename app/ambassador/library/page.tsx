"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Mail, Video, FileText, Image as ImageIcon, ExternalLink } from "lucide-react"

export default function AmbassadorLibrary() {
    const [activeTab, setActiveTab] = useState("email")

    const emailTemplates = [
        {
            title: "Ambassador Email Template",
            description: "Professional email template for ambassador outreach",
            type: "image",
            file: "/ambassador-resources/AMBASSADOR EMAIL.png",
            preview: "/ambassador-resources/AMBASSADOR EMAIL.png"
        },
        {
            title: "Cold Outreach Email Templates",
            description: "Collection of proven cold outreach email templates",
            type: "document",
            file: "/ambassador-resources/Cold Outreach Email Templates.docx"
        }
    ]

    const storyTemplates = [
        {
            title: "Built for Trainers Video",
            description: "Promotional video showcasing trainer features",
            type: "video",
            file: "/ambassador-resources/BUILT FOR TRAINERS video.mp4",
            thumbnail: "/ambassador-resources/Post Template.png"
        },
        {
            title: "Story Template 3",
            description: "Engaging story format for social media",
            type: "video",
            file: "/ambassador-resources/STORY TEMPLATE 3.mp4"
        },
        {
            title: "Story Template 4",
            description: "Alternative story format for variety",
            type: "video",
            file: "/ambassador-resources/STORY TEMPLATE 4.mp4"
        },
        {
            title: "Story Template 5",
            description: "Premium story template",
            type: "video",
            file: "/ambassador-resources/template 5.mp4"
        },
        {
            title: "Post Template",
            description: "Static post template for Instagram/Facebook",
            type: "image",
            file: "/ambassador-resources/Post Template.png",
            preview: "/ambassador-resources/Post Template.png"
        },
        {
            title: "Template 1",
            description: "Social media post template design 1",
            type: "image",
            file: "/ambassador-resources/TEMPLATE 1.png",
            preview: "/ambassador-resources/TEMPLATE 1.png"
        },
        {
            title: "Template 2",
            description: "Social media post template design 2",
            type: "image",
            file: "/ambassador-resources/TEMPLATE 2.png",
            preview: "/ambassador-resources/TEMPLATE 2.png"
        }
    ]

    const videoScripts = [
        {
            title: "Promo Video Scripts",
            description: "Ready-to-use scripts for promotional videos",
            type: "document",
            file: "/ambassador-resources/PROMO VIDEO SCRIPTS_.docx"
        }
    ]

    const renderResourceCard = (resource: any) => (
        <Card key={resource.title} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {resource.type === "video" && <Video className="h-5 w-5 text-purple-500" />}
                        {resource.type === "image" && <ImageIcon className="h-5 w-5 text-blue-500" />}
                        {resource.type === "document" && <FileText className="h-5 w-5 text-green-500" />}
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                </div>
                <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {resource.preview && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-slate-100">
                        <img
                            src={resource.preview}
                            alt={resource.title}
                            className="w-full h-48 object-cover"
                        />
                    </div>
                )}
                {resource.type === "video" && !resource.preview && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center h-48">
                        <Video className="h-16 w-16 text-slate-600" />
                    </div>
                )}
                <div className="flex gap-2">
                    <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => window.open(resource.file, '_blank')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    {(resource.type === "image" || resource.type === "video") && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(resource.file, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Ambassador Library</h1>
                    <p className="text-slate-300">
                        Access all your marketing resources, templates, and scripts in one place
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-slate-800/50 border border-slate-700">
                        <TabsTrigger value="email" className="data-[state=active]:bg-purple-600">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Templates
                        </TabsTrigger>
                        <TabsTrigger value="stories" className="data-[state=active]:bg-purple-600">
                            <Video className="h-4 w-4 mr-2" />
                            Story Templates
                        </TabsTrigger>
                        <TabsTrigger value="scripts" className="data-[state=active]:bg-purple-600">
                            <FileText className="h-4 w-4 mr-2" />
                            Video Scripts
                        </TabsTrigger>
                    </TabsList>

                    {/* Email Templates */}
                    <TabsContent value="email" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {emailTemplates.map(renderResourceCard)}
                        </div>
                    </TabsContent>

                    {/* Story Templates */}
                    <TabsContent value="stories" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storyTemplates.map(renderResourceCard)}
                        </div>
                    </TabsContent>

                    {/* Video Scripts */}
                    <TabsContent value="scripts" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videoScripts.map(renderResourceCard)}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Help Section */}
                <Card className="mt-8 bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Need Help?</CardTitle>
                        <CardDescription className="text-slate-300">
                            Tips for using these resources effectively
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-slate-300 space-y-2">
                        <p>• <strong>Email Templates:</strong> Customize with your personal touch and referral link</p>
                        <p>• <strong>Story Templates:</strong> Use these as inspiration or post directly to your social media</p>
                        <p>• <strong>Video Scripts:</strong> Record yourself reading these scripts for authentic content</p>
                        <p>• <strong>Remember:</strong> Always include your unique referral code in all promotions!</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
