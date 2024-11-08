export class TelegramMessages {
    static welcomeMessage = '🎁 Here you can buy and send gifts to your friends.';
    
    static giftSentMessage = '🎁 I have a gift for you! Tap the button below to open it.';
    
    static createGivenMessage = (senderName: string, giftName: string) => 
      `⚡ ${senderName} has given you the gift of ${giftName}.`;
    
    static createReceivedMessage = (receiverName: string, giftName: string) =>
      `🔥 ${receiverName} received your gift of ${giftName}.`;
      
    static createPurchaseMessage = (giftName: string) =>
      `✅ You have purchased the gift of ${giftName}.`;
  }