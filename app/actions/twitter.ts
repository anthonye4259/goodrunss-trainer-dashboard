"use server"

interface ShareToTwitterData {
  title: string
  value: string
  subtitle?: string
}

export async function generateTweetContent(data: ShareToTwitterData) {
  // Generate tweet text with emojis and hashtags
  const tweetText = `${data.title}: ${data.value} ${data.subtitle ? `(${data.subtitle})` : ""} 💪

Building my training business with @GoodRunss 🚀

#RecSports #WellnessTrainer #SportsTraining #GoodRunss`

  return {
    text: tweetText,
    url: "https://goodrunss.com",
  }
}

export async function getTwitterShareUrl(data: ShareToTwitterData) {
  const content = await generateTweetContent(data)

  // Create Twitter Web Intent URL
  const params = new URLSearchParams({
    text: content.text,
    url: content.url,
  })

  return `https://twitter.com/intent/tweet?${params.toString()}`
}
