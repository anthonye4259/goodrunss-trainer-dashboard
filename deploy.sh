#!/bin/bash
echo "🚀 Deploying GoodRunss Trainer Dashboard..."
echo ""
echo "Step 1: Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Pushed to GitHub successfully!"
    echo ""
    echo "Step 2: Triggering Vercel deployment..."
    curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_vJyhGpE6d793U6s03ErJDznqaFt5/fSKs16LE0b"
    echo ""
    echo ""
    echo "🎉 Deployment triggered! Check Vercel dashboard for progress."
else
    echo "❌ Failed to push to GitHub. Please check your credentials."
fi
