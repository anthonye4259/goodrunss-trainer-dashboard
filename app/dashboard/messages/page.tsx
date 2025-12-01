import { UnifiedInbox } from "@/components/messages/unified-inbox"

export default function MessagesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Manage client conversations and approve AI drafts
          </p>
        </div>
      </div>

      <UnifiedInbox />
    </div>
  )
}
