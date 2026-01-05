import { Client, GatewayIntentBits, REST, Routes } from 'discord.js'

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
})

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN)

// Bot ready event
client.once('ready', () => {
  console.log(`✅ Discord bot logged in as ${client.user?.tag}`)
})

// Add user to Discord server with Premium role
export async function addUserToDiscord(discordUserId: string): Promise<boolean> {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const member = await guild.members.fetch(discordUserId)
    
    if (!member) {
      console.error(`Member ${discordUserId} not found in guild`)
      return false
    }
    
    // Get Premium Member role
    const role = guild.roles.cache.find(r => r.name === 'Premium Member')
    
    if (!role) {
      console.error('Premium Member role not found')
      return false
    }
    
    // Add role
    await member.roles.add(role)
    
    // Send welcome DM
    try {
      await member.send({
        content: `🎉 Welcome to FourXClub Premium Discord!
        
Your subscription is now active. You have access to:
✅ Exclusive trading channels
✅ Live market analysis
✅ Direct mentor support
✅ Premium trading signals

Enjoy your membership! 🚀`
      })
    } catch (dmError) {
      console.log('Could not send DM to user (DMs might be disabled)')
    }
    
    console.log(`✅ Added premium role to ${member.user.tag}`)
    return true
    
  } catch (error) {
    console.error('Error adding user to Discord:', error)
    return false
  }
}

// Remove user from Discord (remove Premium role)
export async function removeUserFromDiscord(discordUserId: string): Promise<boolean> {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const member = await guild.members.fetch(discordUserId)
    
    if (!member) {
      console.error(`Member ${discordUserId} not found in guild`)
      return false
    }
    
    // Get Premium Member role
    const role = guild.roles.cache.find(r => r.name === 'Premium Member')
    
    if (!role) {
      console.error('Premium Member role not found')
      return false
    }
    
    // Remove role
    await member.roles.remove(role)
    
    // Send cancellation DM
    try {
      await member.send({
        content: `Your FourXClub Premium subscription has ended.

We hope you enjoyed your time with us! You can resubscribe anytime at https://fourxclub.in/discord

Thank you for being a member! 💙`
      })
    } catch (dmError) {
      console.log('Could not send DM to user')
    }
    
    console.log(`✅ Removed premium role from ${member.user.tag}`)
    return true
    
  } catch (error) {
    console.error('Error removing user from Discord:', error)
    return false
  }
}

// Check if user is in server
export async function isUserInDiscord(discordUserId: string): Promise<boolean> {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const member = await guild.members.fetch(discordUserId)
    return !!member
  } catch {
    return false
  }
}

// Get Discord server stats
export async function getDiscordStats() {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID!)
    const role = guild.roles.cache.find(r => r.name === 'Premium Member')
    
    return {
      totalMembers: guild.memberCount,
      premiumMembers: role?.members.size || 0,
      onlineMembers: guild.members.cache.filter(m => m.presence?.status !== 'offline').size
    }
  } catch (error) {
    console.error('Error getting Discord stats:', error)
    return null
  }
}

export { client }