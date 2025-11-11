// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const { Octokit } = require('@octokit/rest');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Preset states + Image IDs for your Roblox game
const STATES = {
  great: { imageId: "376788359", text: "Great" },
  good: { imageId: "20722053", text: "Good" },
  fine: { imageId: "144080495", text: "Fine" },
  mid: { imageId: "58965400", text: "Mid" },
  bad: { imageId: "3868600", text: "Bad" },
  verybad: { imageId: "14812835", text: "Very Bad" },
  horrible: { imageId: "37700586", text: "Horrible" },
};

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // Example command: !setstate good "Servers are fast again!"
  if (msg.content.startsWith("!setstate")) {
    const match = msg.content.match(/^!setstate\s+(\S+)\s+"([^"]+)"$/);
    if (!match) {
      return msg.reply('❌ Usage: !setstate <state> "reason"');
    }

    const [, state, reason] = match;
    const lower = state.toLowerCase();

    if (!STATES[lower]) {
      return msg.reply(`❌ Invalid state. Use: ${Object.keys(STATES).join(", ")}`);
    }

    const data = {
      state: STATES[lower].text,
      imageId: STATES[lower].imageId,
      reason,
      updatedAt: new Date().toISOString(),
    };

    try {
      await octokit.gists.update({
        gist_id: GIST_ID,
        files: {
          "roblox_state.json": {
            content: JSON.stringify(data, null, 2),
          },
        },
        description: `Roblox State: ${data.state}`,
      });

      msg.reply(`✅ State updated to **${data.state.toUpperCase()}**: "${reason}"`);
      console.log(`Updated gist with ${data.state}`);
    } catch (err) {
      console.error(err);
      msg.reply("⚠️ Failed to update gist. Check your tokens!");
    }
  }
});

client.login(DISCORD_TOKEN);
