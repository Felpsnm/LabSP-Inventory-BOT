//Webex Bot Starter - featuring the webex-node-bot-framework - https://www.npmjs.com/package/webex-node-bot-framework
require("dotenv").config();
var framework = require("webex-node-bot-framework");
var webhook = require("webex-node-bot-framework/webhook");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var addRowCard = require("./Cards/addRowCard.json");
var getRowCard = require("./Cards/getRowCard.json");

app.use(bodyParser.json());
app.use(express.static("images"));

const config = {
  token: process.env.BOTTOKEN,
  restrictedToEmailDomains: "cisco.com",
};

// Only pass the webhook URL and port if it has been set in the environment
if (process.env.WEBHOOKURL && process.env.PORT) {
  config.webhookUrl = process.env.WEBHOOKURL;
  config.port = process.env.PORT;
}


// init framework
var framework = new framework(config);
framework.start();
console.log("Starting framework, please wait...");

framework.on("initialized", () => {
  console.log("framework is all fired up! [Press CTRL-C to quit]");
});

// A spawn event is generated when the framework finds a space with your bot in it
// If actorId is set, it means that user has just added your bot to a new space
// If not, the framework has discovered your bot in an existing space
framework.on("spawn", (bot, id, actorId) => {
  if (!actorId) {
    // don't say anything here or your bot's spaces will get
    // spammed every time your server is restarted
    console.log(
      `While starting up, the framework found our bot in a space called: ${bot.room.title}`
    );
  } else {
    // When actorId is present it means someone added your bot got added to a new space
    // Lets find out more about them..
    var msg =
      "You can say `help` to get the list of words I am able to respond to.";
    bot.webex.people
      .get(actorId)
      .then((user) => {
        msg = `Hello there ${user.displayName}. ${msg}`;
      })
      .catch((e) => {
        console.error(
          `Failed to lookup user details in framwork.on("spawn"): ${e.message}`
        );
        msg = `Hello there. ${msg}`;
      })
      .finally(() => {
        // Say hello, and tell users what you do!
        if (bot.isDirect) {
          bot.say("markdown", msg);
        } else {
          let botName = bot.person.displayName;
          msg += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${botName}.`;
          bot.say("markdown", msg);
        }
      });
  }
});

// Implementing a framework.on('log') handler allows you to capture
// events emitted from the framework.  Its a handy way to better understand
// what the framework is doing when first getting started, and a great
// way to troubleshoot issues.
// You may wish to disable this for production apps
framework.on("log", (msg) => {
  console.log(msg);
});

// Process incoming messages
// Each hears() call includes the phrase to match, and the function to call if webex mesages
// to the bot match that phrase.
// An optional 3rd parameter can be a help string used by the frameworks.showHelp message.
// An optional fourth (or 3rd param if no help message is supplied) is an integer that
// specifies priority.   If multiple handlers match they will all be called unless the priority
// was specified, in which case, only the handler(s) with the lowest priority will be called

framework.hears(
  "add",
  (bot) => {
    console.log("add command received"); 
    bot.sendCard(addRowCard);

    framework.on('attachmentAction', (bot, trigger) => {
      const script_path = ['./Scripts/addRowSPInventory.py'];
      const cardInputs = trigger.attachmentAction.inputs
      const { spawn } = require('child_process');

      pythonProcess = spawn('python', [script_path, cardInputs.PRODUTO, cardInputs.SERIAL, cardInputs.TAG_ATIVO, cardInputs.PN, cardInputs.RACK]);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        bot.say("markdown", `stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        bot.say("markdown", `stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code == '0') { 
          bot.say("markdown", `A linha foi adicionada com sucesso!`);
        } else if (code == '2') {
          bot.say("markdown", `Erro: Não foi possível adicionar a linha.`);
        } else {
          bot.say("markdown", `child process exited with code ${code}`);
        }
      });
    });

    /*
    Caso queira passar os parâmetros diretamente no texto (Sem Cards)    
    let webex_message = trigger.text;

    let python_args = webex_message.split(' ');
    python_args = python_args.slice(3, 8);
    python_args = script_path.concat(python_args);  
    
    */
  },
  "**add**: (add a row to Cisco SP Inventory)",
  0
);

framework.hears(
  "search",
  (bot) => {
    console.log("search command received"); 
    bot.sendCard(getRowCard);

    framework.on('attachmentAction', (bot, trigger) => {
      const script_path = ['./Scripts/getRowsSPInventory.py'];
      const cardInputs = trigger.attachmentAction.inputs
      const { spawn } = require('child_process');

      pythonProcess = spawn('python', [script_path, cardInputs.COLUMN, cardInputs.QUERY]);

      pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        bot.say("markdown", `${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        bot.say("markdown", `stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code == '0') { 
          bot.say("markdown", `Pesquisa realizada com sucesso!`);
        } else if (code == '2') {
          bot.say("markdown", `Erro: Não foi possível realizar a pesquisa.`);
        } else {
          bot.say("markdown", `child process exited with code ${code}`);
        }
      });
    });
  },
  "**search**: (Get matching rows of the Cisco SP Inventory)",
  0
);

/* On mention with command
ex User enters @botname help, the bot will write back in markdown
 *
 * The framework.showHelp method will use the help phrases supplied with the previous
 * framework.hears() commands
*/
framework.hears(
  /help|what can i (do|say)|what (can|do) you do/i,
  (bot, trigger) => {
    console.log(`someone needs help! They asked ${trigger.text}`);
    bot
      .say(`Hello ${trigger.person.displayName}.`)
      //    .then(() => sendHelp(bot))
      .then(() => bot.say("markdown", framework.showHelp()))
      .catch((e) => console.error(`Problem in help hander: ${e.message}`));
  },
  "**help**: (what you are reading now)",
  0
);

/* On mention with unexpected bot command
   Its a good practice is to gracefully handle unexpected input
   Setting the priority to a higher number here ensures that other
   handlers with lower priority will be called instead if there is another match
*/
framework.hears(
  /.*/,
  (bot, trigger) => {
    // This will fire for any input so only respond if we haven't already
    console.log(`catch-all handler fired for user input: ${trigger.text}`);
    bot
      .say(`Sorry, I don't know how to respond to "${trigger.text}"`)
      .then(() => bot.say("markdown", framework.showHelp()))
      //    .then(() => sendHelp(bot))
      .catch((e) =>
        console.error(`Problem in the unexepected command hander: ${e.message}`)
      );
  },
  99999
);

//Server config & housekeeping
// Health Check
app.get("/", (req, res) => {
  res.send(`I'm alive.`);
});

app.post("/", webhook(framework));

var server = app.listen(config.port, () => {
  framework.debug("framework listening on port %s", config.port);
});

// gracefully shutdown (ctrl-c)
process.on("SIGINT", () => {
  framework.debug("stopping...");
  server.close();
  framework.stop().then(() => {
    process.exit();
  });
});
