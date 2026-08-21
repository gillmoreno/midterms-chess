/** Five hooks per killer→victim pair. heat: soft | sly | hot */

export const FILMED = {
  "maga:activist": true,
  "activist:maga": true,
};

export const VOICES = {
  trump: { id: "rex", label: "Rex — bombastic, laughing" },
  melania: { id: "ara", label: "Ara — cool, almost a whisper" },
  mcconnell: { id: "helix", label: "Helix — slow, dry, procedural" },
  rubio: { id: "leo", label: "Leo — bright, a little breathless" },
  cruz: { id: "kepler", label: "Kepler — preacher, nasal, delighted" },
  rfk: { id: "orion", label: "Orion — hoarse, earnest, a little cracked" },
  vance: { id: "lux", label: "Lux — flat, mean, essay-voice" },
  desantis: { id: "atlas", label: "Atlas — clipped, gubernatorial" },
  maga: { id: "rex", label: "Rex — loud, laughing, dump the drum" },
  newsom: { id: "sirius", label: "Sirius — slick, hair-gel confident" },
  aoc: { id: "eve", label: "Eve — sharp, smiling, then the shot" },
  sanders: { id: "perseus", label: "Perseus — gravel, pointing" },
  schumer: { id: "lumen", label: "Lumen — majority-leader, no rush" },
  harris: { id: "luna", label: "Luna — prosecutor, then a laugh" },
  warren: { id: "celeste", label: "Celeste — schoolteacher with a plan" },
  buttigieg: { id: "helix", label: "Helix — calm, municipal, deadly" },
  mamdani: { id: "cosmo", label: "Cosmo — bright, City Hall, then the lance" },
  activist: { id: "iris", label: "Iris — California, shout the line, then the rifle" },
};

export const DELIVERY = {
  trump: "Shouts the line, points, laughs, then fires.",
  melania: "Almost whispers it. One clean shot. Does not blink.",
  mcconnell: "Mutters it like a ruling. Then the gavel is a gun.",
  rubio: "Speaks too fast, catches himself, then dumps the clip.",
  cruz: "Preaches the line, finger in the air, then the rifle.",
  rfk: "Hoarse town-hall cadence. Then the shot.",
  vance: "Deadpan, one breath, then a short burst.",
  desantis: "Reads it like a statute. Then Florida opens fire.",
  maga: "Says the line, laughs, then dumps the drum.",
  newsom: "Slicks it out, poses, then a clean burst.",
  aoc: "Smiles the line into the camera, then shoots.",
  sanders: "Points, repeats the last three words, then fires.",
  schumer: "Has the floor. Yields nothing. Then the shot.",
  harris: "Prosecutor cadence. Case closed. Then the gun.",
  warren: "Announces the plan. Step two is the trigger.",
  buttigieg: "Calm briefing voice. Then infrastructure of lead.",
  mamdani: "Smiles it like a subway ad, then the lance.",
  activist: "Says the line, then the rifle.",
};

function H(a, b, c, d, e) {
  return [a, b, c, d, e];
}
function L(text, heat) {
  return { text: text, heat: heat };
}

export const LINES = {
  trump: {
    vs: {
      newsom: H(
        L("California's closed, Gavin. Forever.", "hot"),
        L("Hair this good, and I still beat you.", "sly"),
        L("Nice tan. Bad square.", "soft"),
        L("Newsom 2028 just got redistricted.", "sly"),
        L("I built a tower. You built a train to nowhere.", "hot")
      ),
      aoc: H(
        L("The squad just got benched, honey.", "hot"),
        L("Tax this.", "sly"),
        L("Cute speech. Wrong room.", "soft"),
        L("Green New Deal, meet old-fashioned lead.", "sly"),
        L("You're fired from Congress, sweetheart.", "hot")
      ),
      sanders: H(
        L("Socialism's dead. I killed it.", "hot"),
        L("Feel the Bern. That's the muzzle.", "sly"),
        L("Bernie, sit down. You've been standing since '76.", "soft"),
        L("The billionaire class just collected.", "sly"),
        L("I am once again asking you to fall down.", "hot")
      ),
      schumer: H(
        L("Chuck, you're adjourned.", "hot"),
        L("New York's mayor of talking just lost the mic.", "sly"),
        L("Yield the floor, Chuck.", "soft"),
        L("I have the votes. You have a funeral.", "sly"),
        L("Schumer. Finished. Next.", "hot")
      ),
      harris: H(
        L("No word salad on the way out.", "hot"),
        L("I'm speaking. You're leaving.", "sly"),
        L("That laugh just ran out of airtime.", "soft"),
        L("Unburdened by what has been. Namely you.", "sly"),
        L("Worst debate of your life. Second place.", "hot")
      ),
      warren: H(
        L("I built this. You just occupied it.", "hot"),
        L("I have a plan for Liz. It's short.", "sly"),
        L("Two cents? Keep the change.", "soft"),
        L("Pocahontas, the trail ends here.", "hot"),
        L("Nevertheless, she persisted. Until now.", "sly")
      ),
      buttigieg: H(
        L("Mayor Pete, you're out of a town.", "hot"),
        L("Maltese is cute. Losing isn't.", "sly"),
        L("Go inspect a pothole, kid.", "soft"),
        L("South Bend called. They want a quieter mayor.", "sly"),
        L("Navy taught you honor. I taught you chess.", "hot")
      ),
      mamdani: H(
        L("Mayor of a city I just took.", "hot"),
        L("Nice scarf. Wrong country.", "sly"),
        L("Kid, go run a bus.", "soft"),
        L("Pride flag, city hall, no square.", "sly"),
        L("Free buses. Expensive ending.", "hot")
      ),
      activist: H(
        L("Your pronouns are: you, former.", "hot"),
        L("That's a lot of hair for so little square.", "sly"),
        L("Kid, go home.", "soft"),
        L("The resistance just resisted poorly.", "sly"),
        L("Beanie off. Lights out.", "hot")
      ),
    },
  },
  melania: {
    vs: {
      newsom: H(
        L("You are so... California.", "sly"),
        L("The hair is trying too hard. Like you.", "sly"),
        L("I have worn better governors as accessories.", "hot"),
        L("Smile less. It will not help.", "soft"),
        L("Sacramento is not Milan. Obviously.", "soft")
      ),
      aoc: H(
        L("The dress cost more than your district.", "hot"),
        L("I really don't care. Do you? Not anymore.", "sly"),
        L("That jacket was a warning. This is the postscript.", "sly"),
        L("Sit. The photographers have left.", "soft"),
        L("Congress is a hallway. I just closed it.", "hot")
      ),
      sanders: H(
        L("Please. The volume.", "sly"),
        L("The mittens were cuter than this.", "soft"),
        L("You shout. I finish.", "hot"),
        L("Old man, the coat is enough personality.", "sly"),
        L("I do not do rallies. I do endings.", "hot")
      ),
      schumer: H(
        L("You talk too much. No more.", "hot"),
        L("Brooklyn energy. Park Avenue ending.", "sly"),
        L("I have sat through worse dinners.", "soft"),
        L("The majority leader just became a footnote.", "sly"),
        L("Quiet, Charles.", "hot")
      ),
      harris: H(
        L("Smile for no one now.", "hot"),
        L("The pearls cannot save the square.", "sly"),
        L("I was a model. You were a moment.", "sly"),
        L("We can do photos later. We will not.", "soft"),
        L("I'm speaking. Softly. Over you.", "hot")
      ),
      warren: H(
        L("I have many houses. You have none.", "hot"),
        L("Your plan did not include me.", "sly"),
        L("Nevertheless. No.", "sly"),
        L("I persist in not being impressed.", "soft"),
        L("Two cents on the dollar. Zero on the board.", "hot")
      ),
      buttigieg: H(
        L("So young. So over.", "sly"),
        L("The mayor look is very... municipal.", "soft"),
        L("I have ended more elegant men.", "hot"),
        L("Translate this: goodbye.", "sly"),
        L("South Bend cannot see you from here.", "soft")
      ),
      mamdani: H(
        L("Sit down, mayor.", "hot"),
        L("The subway was never for me.", "sly"),
        L("City Hall should have stayed standing.", "sly"),
        L("Young. Finished.", "soft"),
        L("I do not do photo ops with the fallen.", "hot")
      ),
      activist: H(
        L("That hair. That ending.", "sly"),
        L("The beanie is a choice. This is mine.", "soft"),
        L("Child, this is not your runway.", "hot"),
        L("I have worn louder colors than your cause.", "sly"),
        L("Protest over. Fashion week continues.", "soft")
      ),
    },
  },
  mcconnell: {
    vs: {
      newsom: H(
        L("California yields the floor.", "hot"),
        L("The chair does not recognize Sacramento.", "sly"),
        L("Noted. Overruled.", "soft"),
        L("We will take that under advisement. And bury it.", "sly"),
        L("Gavin, the Senate just outlived your state.", "hot")
      ),
      aoc: H(
        L("The gentlelady is out of order. Permanently.", "hot"),
        L("One minute. That's all you get. That's all you got.", "sly"),
        L("The freshman should sit.", "soft"),
        L("Points of order do not apply to the dead.", "sly"),
        L("Squad's adjourned.", "hot")
      ),
      sanders: H(
        L("Amendment rejected.", "hot"),
        L("I have tabled better revolutions.", "sly"),
        L("The senator from Vermont will take his seat.", "soft"),
        L("Thirty years. One vote. Mine.", "sly"),
        L("Socialism fails in committee. And here.", "hot")
      ),
      schumer: H(
        L("Leader Schumer. Former leader.", "hot"),
        L("I have the votes. You had a hallway.", "sly"),
        L("We used to talk. We are done talking.", "soft"),
        L("Cloture on Chuck.", "sly"),
        L("The other side of the aisle just ended.", "hot")
      ),
      harris: H(
        L("Cloture. On you.", "hot"),
        L("The vice chair is vacated.", "sly"),
        L("The record will reflect a loss.", "soft"),
        L("I was here before the laugh. I'll be here after.", "sly"),
        L("Prosecutor, meet procedure.", "hot")
      ),
      warren: H(
        L("I have the votes. You have a problem.", "hot"),
        L("Your plan dies in my committee.", "sly"),
        L("The senator will refrain.", "soft"),
        L("Nevertheless, the motion fails.", "sly"),
        L("I persist in winning.", "hot")
      ),
      buttigieg: H(
        L("Transportation is delayed. Forever.", "hot"),
        L("The young man is not recognized.", "sly"),
        L("Sit, mayor.", "soft"),
        L("Infrastructure week is cancelled.", "sly"),
        L("The trains do not run through my floor.", "hot")
      ),
      mamdani: H(
        L("The Senate will come to order. Without you.", "hot"),
        L("The mayor is out of order.", "sly"),
        L("The gentleman from Queens yields.", "soft"),
        L("Campaign clips do not survive my gavel.", "sly"),
        L("I have buried louder socialists.", "hot")
      ),
      activist: H(
        L("No demonstration on my floor.", "hot"),
        L("The gallery will be cleared.", "sly"),
        L("Young person, this is not a rally.", "soft"),
        L("Signs are not recognized as motions.", "sly"),
        L("The chair has spoken. The chair has fired.", "hot")
      ),
    },
  },
  rubio: {
    vs: {
      newsom: H(
        L("Florida sends its regards, Gavin.", "hot"),
        L("Little Marco just took your lunch.", "sly"),
        L("Drink water. Then sit down.", "soft"),
        L("Your hair lost to my humidity.", "sly"),
        L("California, meet a state that actually works.", "hot")
      ),
      aoc: H(
        L("The Green New Deal is cancelled.", "hot"),
        L("I speak Spanish. You speak slogans.", "sly"),
        L("Congresswoman, that's enough.", "soft"),
        L("Tax the rich? Tax this square.", "sly"),
        L("The squad just got redistricted to zero.", "hot")
      ),
      sanders: H(
        L("The revolution will not be funded.", "hot"),
        L("Bernie, I was young once. I grew up.", "sly"),
        L("The mittens lose.", "soft"),
        L("Democratic socialism, meet Florida math.", "sly"),
        L("I am once again asking you to lose.", "hot")
      ),
      schumer: H(
        L("Chuck, I speak Spanish. And goodbye.", "sly"),
        L("The majority just moved south.", "hot"),
        L("Leader, I have the floor now.", "soft"),
        L("Brooklyn, this is Miami calling collect.", "sly"),
        L("Schumer's finished. Marco's just getting started.", "hot")
      ),
      harris: H(
        L("Border's that way. You missed it.", "hot"),
        L("I'm speaking too. Faster.", "sly"),
        L("Madam Vice President — former.", "soft"),
        L("The laugh just hit a wall. Mine.", "sly"),
        L("Unburdened by Kamala.", "hot")
      ),
      warren: H(
        L("I have the plan. You had a sign.", "sly"),
        L("Two cents can't buy this square.", "hot"),
        L("Senator, that's a no.", "soft"),
        L("Your 12-point memo just became a eulogy.", "sly"),
        L("Nevertheless, she lost.", "hot")
      ),
      buttigieg: H(
        L("Mayor of nowhere now.", "hot"),
        L("I did the debates too. I stayed standing.", "sly"),
        L("Pete, go translate a concession.", "soft"),
        L("South Bend is not a foreign policy.", "sly"),
        L("Little Pete just met a bigger Marco.", "hot")
      ),
      mamdani: H(
        L("Queens called. They want the speech back.", "sly"),
        L("Mayor, the uprising is over.", "hot"),
        L("Zohran, drink water. Then sit.", "soft"),
        L("Little mayor, big Florida.", "sly"),
        L("New York just got out-Florida'd.", "hot")
      ),
      activist: H(
        L("Drink water. Then sit down.", "soft"),
        L("The beanie is not a platform.", "sly"),
        L("Kid, this is the grown-up table.", "hot"),
        L("Protest on your own time. This is mine.", "sly"),
        L("Go woke on somebody else's square.", "hot")
      ),
    },
  },
  cruz: {
    vs: {
      newsom: H(
        L("Cancun was practice. This is the trip.", "hot"),
        L("The Constitution does not mention your hair.", "sly"),
        L("Gavin, you're out of order and out of state.", "sly"),
        L("California seceded. From the board.", "hot"),
        L("I packed. You unpacked. Wrong move.", "soft")
      ),
      aoc: H(
        L("The tax-the-rich ad just ran out of budget.", "sly"),
        L("Zodiac doesn't cover this loss.", "hot"),
        L("The gentlelady from the internet is finished.", "sly"),
        L("Facts don't care about your squad.", "hot"),
        L("One minute expired. So did you.", "soft")
      ),
      sanders: H(
        L("Democratic socialism: zero. Cruz: one.", "hot"),
        L("I filibustered your entire century.", "sly"),
        L("The senator from Vermont is recognized. As gone.", "sly"),
        L("Feel the Bern. That's called losing.", "hot"),
        L("Sit, Bernie. The Constitution stands.", "soft")
      ),
      schumer: H(
        L("I filibustered you out of existence.", "hot"),
        L("Chuck, I object. To everything you are.", "sly"),
        L("The record will show a Texas win.", "soft"),
        L("Majority leader, meet a minority of one left.", "sly"),
        L("Yield. You already did.", "hot")
      ),
      harris: H(
        L("The record will show you lost.", "hot"),
        L("Word salad is not a legal argument.", "sly"),
        L("Madam, the Constitution has spoken.", "soft"),
        L("I was a solicitor general. You're a footnote.", "sly"),
        L("Unburdened? You're unloaded.", "hot")
      ),
      warren: H(
        L("I am a constitutionalist. You are history.", "hot"),
        L("Your plan is unconstitutional. And over.", "sly"),
        L("Senator, that's not how amendments work.", "soft"),
        L("Nevertheless, originalism wins.", "sly"),
        L("The CFPB can't fine a bullet.", "hot")
      ),
      buttigieg: H(
        L("The Navy called. Dishonorable.", "hot"),
        L("Mayor, this is not a city council.", "sly"),
        L("Go run a town hall. In the past.", "soft"),
        L("I debate in complete sentences. You just ended.", "sly"),
        L("South Bend, Texas just annexed you.", "hot")
      ),
      mamdani: H(
        L("I object. Sustained. Dead.", "hot"),
        L("Socialism vs. the Constitution. Guess who won.", "sly"),
        L("The mayor will take his seat. Permanently.", "sly"),
        L("Free buses are not case law.", "soft"),
        L("Queens, your appeal is denied.", "hot")
      ),
      activist: H(
        L("Facts don't care about your beanie.", "hot"),
        L("This is not a safe space. It's a square.", "sly"),
        L("Young lady, the First Amendment isn't a shield.", "soft"),
        L("Your sign lost to a statute.", "sly"),
        L("Go protest someone who loses.", "hot")
      ),
    },
  },
  rfk: {
    vs: {
      newsom: H(
        L("Gavin, your state is the experiment. It failed.", "hot"),
        L("I studied your water. Then I ended you.", "sly"),
        L("Governor, sit. The chronic is over.", "soft"),
        L("California's the control group. You're the casualty.", "sly"),
        L("Hair-gel isn't a health plan.", "hot")
      ),
      aoc: H(
        L("The squad just got a diagnosis.", "hot"),
        L("Congresswoman, I left your party. Then I left you.", "sly"),
        L("That's enough TikTok medicine.", "soft"),
        L("Tax the rich. I taxed the square.", "sly"),
        L("Green New Deal, meet an old Kennedy with a gun.", "hot")
      ),
      sanders: H(
        L("Bernie, I used to knock doors with you. Not anymore.", "hot"),
        L("The revolution needed a doctor. I'm the autopsy.", "sly"),
        L("Sit down, senator. The vitamins kicked in.", "soft"),
        L("I am once again asking you to fall over.", "hot"),
        L("Socialism's a comorbidity.", "sly")
      ),
      schumer: H(
        L("Chuck, New York's my name too. I kept it.", "hot"),
        L("I can work with anyone. I just wouldn't.", "sly"),
        L("Leader, yield the floor. And the pulse.", "soft"),
        L("Majority of one: me.", "sly"),
        L("The machine just met a Kennedy who didn't play.", "hot")
      ),
      harris: H(
        L("Kamala, that laugh is a symptom.", "sly"),
        L("I unburdened you. Permanently.", "hot"),
        L("Prosecutor, the case is closed. So are you.", "sly"),
        L("Madam, drink water. From a clean glass. In the past.", "soft"),
        L("The ticket lost. This is the recount.", "hot")
      ),
      warren: H(
        L("Liz, I have a plan for you. It's short.", "hot"),
        L("Nevertheless, she persisted. Until she didn't.", "sly"),
        L("Senator, that's enough worksheets.", "soft"),
        L("Two cents. One shot.", "sly"),
        L("The plan had twelve points. This is the last.", "hot")
      ),
      buttigieg: H(
        L("Pete, the airports were the least of it.", "sly"),
        L("Mayor, go inspect a closed case.", "hot"),
        L("South Bend, this is a recall.", "sly"),
        L("Lovely briefing. Terminal.", "soft"),
        L("Infrastructure of lead. You're the pothole.", "hot")
      ),
      mamdani: H(
        L("Zohran, free buses don't outrun a Kennedy.", "hot"),
        L("Mayor, the city already had one of me. I'm the sequel.", "sly"),
        L("Queens, sit. The ad is over.", "soft"),
        L("I know your side. I left it. Then I ended it.", "sly"),
        L("Socialism, meet a name older than your subway.", "hot")
      ),
      activist: H(
        L("Kid, I protested before your beanie was born.", "hot"),
        L("The sign is a toxin. So was standing there.", "sly"),
        L("Go home. Hydrate. Stay gone.", "soft"),
        L("That's not medicine. That's a loss.", "sly"),
        L("The comment section isn't a clinic.", "hot")
      ),
    },
  },
  vance: {
    vs: {
      newsom: H(
        L("Appalachia just out-governed Sacramento.", "hot"),
        L("Yale taught me how to end a governor.", "sly"),
        L("Gavin, that's enough cologne.", "soft"),
        L("Hillbilly elegy. California edition.", "sly"),
        L("Your state writes movies. Mine writes endings.", "hot")
      ),
      aoc: H(
        L("The squad is a book club. Closed.", "sly"),
        L("Weird. And done.", "hot"),
        L("Congresswoman, go tweet a concession.", "soft"),
        L("I wrote a memoir. You're a footnote.", "sly"),
        L("The Bronx just lost to Middletown.", "hot")
      ),
      sanders: H(
        L("The factory left. So did you.", "hot"),
        L("Bernie, the working class voted. Not for you.", "sly"),
        L("Sit, professor.", "soft"),
        L("Elegy for a revolution that never shipped.", "sly"),
        L("Ohio steel, Vermont rust.", "hot")
      ),
      schumer: H(
        L("New York elites, meet Ohio steel.", "hot"),
        L("Chuck, the heartland just called collect.", "sly"),
        L("Leader, that's a no from the cheap seats.", "soft"),
        L("I wrote about people like you. Unkindly.", "sly"),
        L("The Senate just got a vacancy. Yours.", "hot")
      ),
      harris: H(
        L("Yale law. Ohio boot.", "hot"),
        L("I'm speaking, in complete clauses.", "sly"),
        L("Madam, the Midwest declined.", "soft"),
        L("Unburdened by coastal consultants.", "sly"),
        L("The laugh stopped at the Ohio River.", "hot")
      ),
      warren: H(
        L("You have a plan for everything except this.", "sly"),
        L("Yale taught us both. I passed.", "hot"),
        L("Senator, the memo is incomplete.", "soft"),
        L("Nevertheless, Ohio.", "sly"),
        L("Two cents on a dollar I already spent.", "hot")
      ),
      buttigieg: H(
        L("Two Yales walk in. One walks out.", "hot"),
        L("Pete, I brought the elegy. You brought a résumé.", "sly"),
        L("Mayor, go brief a smaller room.", "soft"),
        L("We both speak consultant. I speak last.", "sly"),
        L("South Bend is a suburb of this loss.", "hot")
      ),
      mamdani: H(
        L("The rent freeze wasn't enough.", "sly"),
        L("Mayor, the plant closed.", "hot"),
        L("Zohran, save the clip for Queens.", "soft"),
        L("Affordability is not a jobs program.", "sly"),
        L("New York soul, Ohio ending.", "hot")
      ),
      activist: H(
        L("Go back to the dorm.", "soft"),
        L("The beanie is doing a lot of work. Was.", "sly"),
        L("This is what happens off campus.", "hot"),
        L("I wrote your type. Then I edited you out.", "sly"),
        L("The working class just clocked you out.", "hot")
      ),
    },
  },
  desantis: {
    vs: {
      newsom: H(
        L("I debated you once. This is the rematch.", "hot"),
        L("Florida is where California comes to retire. You just did.", "sly"),
        L("Gavin, the hair lost.", "soft"),
        L("Freedom over Hollywood.", "sly"),
        L("Your state wrote the rules. Mine ended the game.", "hot")
      ),
      aoc: H(
        L("The state of Florida rejects your resolution.", "hot"),
        L("Don't say gay. Don't say anything.", "hot"),
        L("Congresswoman, that's not how statutes work.", "soft"),
        L("The Green New Deal melts in this heat.", "sly"),
        L("Squad's not welcome south of the line.", "sly")
      ),
      sanders: H(
        L("Socialism doesn't sun well.", "sly"),
        L("Bernie, Florida man wins again.", "hot"),
        L("The mittens are off-season.", "soft"),
        L("Vermont energy, Florida ending.", "sly"),
        L("I don't fund revolutions. I end them.", "hot")
      ),
      schumer: H(
        L("Disney lost. You lost harder.", "hot"),
        L("Chuck, I fight my own corporations. And you.", "sly"),
        L("Leader, take a lap. In the ocean.", "soft"),
        L("The majority just moved to Tallahassee.", "sly"),
        L("New York can keep the bagels. I'll keep the square.", "hot")
      ),
      harris: H(
        L("Don't come to Florida. You didn't.", "sly"),
        L("The border is a concept. This ending isn't.", "hot"),
        L("Madam, the sunshine state declined.", "soft"),
        L("I'm speaking. In a statute.", "sly"),
        L("Unburdened by Florida. Permanently.", "hot")
      ),
      warren: H(
        L("I don't have a plan. I have a statute.", "sly"),
        L("Your memo is not enforceable here.", "hot"),
        L("Senator, that's a northern problem.", "soft"),
        L("Nevertheless, the governor of Florida.", "sly"),
        L("Two cents won't buy a condo. Or a square.", "hot")
      ),
      buttigieg: H(
        L("Your trains don't run in my state.", "sly"),
        L("Mayor, we do highways. And endings.", "hot"),
        L("Pete, go brief a cooler climate.", "soft"),
        L("Infrastructure week, Florida edition: you're the pothole.", "sly"),
        L("South Bend is not a coastal power.", "hot")
      ),
      mamdani: H(
        L("Keep Queens.", "soft"),
        L("Mayor, the theme parks are closed to you.", "sly"),
        L("Zohran, I don't do rent freezes. I do statutes.", "hot"),
        L("Socialism melts down here.", "sly"),
        L("The uprising ends at the state line.", "hot")
      ),
      activist: H(
        L("Parental rights. You had none left.", "hot"),
        L("The beanie is not curriculum.", "sly"),
        L("Kid, this isn't a campus.", "soft"),
        L("Don't say gay. Don't say checkmate either.", "sly"),
        L("Go woke on the beach. The tide's coming.", "hot")
      ),
    },
  },
  maga: {
    vs: {
      newsom: H(
        L("Recall this, pretty boy.", "hot"),
        L("Your hair gel just met a red hat.", "sly"),
        L("Governor, go pose somewhere else.", "soft"),
        L("California can keep the traffic. I'll keep the square.", "sly"),
        L("America First. You second. You last.", "hot")
      ),
      aoc: H(
        L("Tax this, congresswoman.", "hot"),
        L("The squad just got MAGA'd.", "sly"),
        L("Nice jacket. Wrong war.", "soft"),
        L("Green New Deal, meet red hat.", "sly"),
        L("Go back to the hearing. It's over.", "hot")
      ),
      sanders: H(
        L("Okay boomer. Permanently.", "hot"),
        L("The mittens lose to open carry.", "sly"),
        L("Bernie, take a load off.", "soft"),
        L("Feel the Bern. That's called a muzzle flash.", "sly"),
        L("The revolution was televised. Then cancelled.", "hot")
      ),
      schumer: H(
        L("Chuck, the base says no.", "hot"),
        L("Majority of one guy in a hat.", "sly"),
        L("Leader, that's a no from the cheap seats.", "soft"),
        L("New York elite, flyover ending.", "sly"),
        L("Schumer's done. The hat stays on.", "hot")
      ),
      harris: H(
        L("Cackling's over.", "hot"),
        L("I'm speaking. Through a rifle.", "sly"),
        L("Madam, the rally moved on.", "soft"),
        L("Unburdened by that laugh.", "sly"),
        L("Worst closing argument of your life.", "hot")
      ),
      warren: H(
        L("I built the gun. You built a plan.", "hot"),
        L("Two cents. One magazine.", "sly"),
        L("Senator, the hat outvotes the memo.", "soft"),
        L("Nevertheless, she got smoked.", "hot"),
        L("Your plan didn't include me. Mistake.", "sly")
      ),
      buttigieg: H(
        L("Mayor of a parking lot.", "hot"),
        L("The trains don't run on rally time.", "sly"),
        L("Pete, go inspect a concession.", "soft"),
        L("Maltese won't save you.", "sly"),
        L("South Bend, this is a real town now.", "hot")
      ),
      mamdani: H(
        L("Mayor who?", "hot"),
        L("The metrocard bounced off the hat.", "sly"),
        L("Zohran, save it for the cameras that left.", "soft"),
        L("Queens soul, rally ending.", "sly"),
        L("I object to your existence on my square.", "hot")
      ),
      activist: H(
        L("You're pronouns are: You, dead!", "hot"),
        L("That's a nice beanie. Was.", "sly"),
        L("Kid, wrong rally.", "soft"),
        L("I identify as the problem.", "sly"),
        L("Go woke, go gone.", "hot")
      ),
    },
  },
  newsom: {
    vs: {
      trump: H(
        L("You're not the president of this square.", "hot"),
        L("I still have better hair. And the board.", "sly"),
        L("Donald, that's enough television.", "soft"),
        L("California just out-glamoured Fifth Avenue.", "sly"),
        L("You're fired from my state of play.", "hot")
      ),
      melania: H(
        L("Beautiful. Brief.", "sly"),
        L("The First Lady look is very last administration.", "soft"),
        L("I do not even look away.", "hot"),
        L("Fashion week called. They want a quieter exit.", "sly"),
        L("The castle just lost its ice.", "hot")
      ),
      mcconnell: H(
        L("Moscow Mitch, California outlasted you.", "hot"),
        L("The turtle crossed. The hair won.", "sly"),
        L("Senator, the future doesn't filibuster.", "soft"),
        L("Cloture on the 20th century.", "sly"),
        L("Your gavel is a museum piece.", "hot")
      ),
      rubio: H(
        L("Little Marco. Big L.", "hot"),
        L("Drink water. You'll need it in defeat.", "sly"),
        L("Florida man, California ending.", "sly"),
        L("Marco, the hair debate is over.", "soft"),
        L("I speak Hollywood. You speak concession.", "hot")
      ),
      cruz: H(
        L("Cancun called. They don't want you either.", "hot"),
        L("The Constitution is not a flotation device.", "sly"),
        L("Ted, pack lighter next time.", "soft"),
        L("Zodiac says: stay home.", "sly"),
        L("Texas energy, California close.", "hot")
      ),
      rfk: H(
        L("Bobby, the worm can't save this square.", "hot"),
        L("I kept the name. You rented it.", "sly"),
        L("Secretary, that's enough raw milk.", "soft"),
        L("The dynasty just got a Hollywood ending.", "sly"),
        L("Make America Healthy. Starting with your absence.", "hot")
      ),
      vance: H(
        L("Ohio can keep the couch.", "sly"),
        L("Hillbilly elegy, Hollywood ending.", "hot"),
        L("J.D., the memoir needed an editor. I provided one.", "sly"),
        L("Yale's enough. Sit.", "soft"),
        L("The heartland just lost the lighting.", "hot")
      ),
      desantis: H(
        L("I still have better hair. And the square.", "hot"),
        L("Rematch. Same result. Better lighting.", "sly"),
        L("Ron, Florida is a vibe. I am a state.", "sly"),
        L("We can debate again. You can lose again.", "soft"),
        L("Woke isn't dead. You are.", "hot")
      ),
      maga: H(
        L("Your hat is red. Your square is mine.", "hot"),
        L("The rally ended at my hairline.", "sly"),
        L("Sir, that's enough shouting.", "soft"),
        L("Open carry, closed casket for the bit.", "sly"),
        L("America First? California finished.", "hot")
      ),
    },
  },
  aoc: {
    vs: {
      trump: H(
        L("The billionaire just got redistributed.", "hot"),
        L("Tax the rich. Starting at the wig.", "sly"),
        L("Sir, that's a wrap.", "soft"),
        L("Your tower just got occupied.", "sly"),
        L("You're not hired. You're done.", "hot")
      ),
      melania: H(
        L("That jacket said I really don't care. Same.", "sly"),
        L("The dress was the message. This is the P.S.", "hot"),
        L("Ma'am, the photos are over.", "soft"),
        L("I tax the rich. I also end them.", "sly"),
        L("Castle's vacant. District's still here.", "hot")
      ),
      mcconnell: H(
        L("Turtle soup is served.", "hot"),
        L("The gentlelady has the floor. You don't.", "sly"),
        L("Senator, that's a wrap on the 90s.", "soft"),
        L("I have one minute. I only needed ten seconds.", "sly"),
        L("Your obstruction just got green-new-dealt.", "hot")
      ),
      rubio: H(
        L("The water boy ran dry.", "sly"),
        L("Little Marco, big public option: goodbye.", "hot"),
        L("Drink water. Then concede.", "soft"),
        L("I speak Spanish and endings.", "sly"),
        L("Florida's favorite intern just got term-limited.", "hot")
      ),
      cruz: H(
        L("The zodiac is cancelled.", "sly"),
        L("Cancun can't save you from the Bronx.", "hot"),
        L("Ted, the Constitution is not your Uber.", "sly"),
        L("That's enough originalism for one day.", "soft"),
        L("Facts care. They say you lost.", "hot")
      ),
      rfk: H(
        L("Bobby, the squad doesn't take medical advice from you.", "hot"),
        L("The worm voted. It voted no.", "sly"),
        L("Secretary, sit. The clinic is closed.", "soft"),
        L("You left the party. We kept the square.", "sly"),
        L("Tax this, doctor.", "hot")
      ),
      vance: H(
        L("Weird. And done.", "hot"),
        L("The memoir needed a better last chapter.", "sly"),
        L("J.D., go write it down. In the past tense.", "soft"),
        L("Yale boy, Bronx ending.", "sly"),
        L("Hillbilly elegy just got a Bronx coda.", "hot")
      ),
      desantis: H(
        L("Don't say gay. Don't say anything.", "hot"),
        L("Florida, the Green New Deal just landed.", "sly"),
        L("Governor, that's a no from the future.", "soft"),
        L("Your statute isn't valid in my district. Or this square.", "sly"),
        L("Woke isn't dead. Your position is.", "hot")
      ),
      maga: H(
        L("Your hat clashed with the future.", "sly"),
        L("The base just got taxed.", "hot"),
        L("Sir, the rally's that way. The exit's this way.", "soft"),
        L("Open carry, closed argument.", "sly"),
        L("I am not aborting you. I'm evicting the bit.", "hot")
      ),
    },
  },
  sanders: {
    vs: {
      trump: H(
        L("I wrote the damn line. You are the damn problem.", "hot"),
        L("The billionaire class ends here.", "hot"),
        L("Donald, sit down.", "soft"),
        L("I am once again asking you to lose.", "sly"),
        L("Your tower is a monument to the problem.", "sly")
      ),
      melania: H(
        L("Another castle. Another vacancy.", "sly"),
        L("The working class cannot afford that dress. Or you.", "hot"),
        L("Ma'am, that's enough quiet luxury.", "soft"),
        L("I do not do fashion. I do endings.", "sly"),
        L("One house is enough. You had too many.", "hot")
      ),
      mcconnell: H(
        L("Thirty years of obstruction. Over.", "hot"),
        L("The turtle just met the movement.", "sly"),
        L("Mitch, the people have spoken. Loudly.", "soft"),
        L("Your gavel is not bigger than this room.", "sly"),
        L("I have been waiting since the 70s. Worth it.", "hot")
      ),
      rubio: H(
        L("The young people are with me. You aren't.", "sly"),
        L("Little Marco, big billionaire problem.", "hot"),
        L("Drink water. Drink defeat.", "soft"),
        L("Florida man, Vermont justice.", "sly"),
        L("I am once again asking you to sit.", "hot")
      ),
      cruz: H(
        L("Ted, the oligarchs can't help you.", "hot"),
        L("Cancun is not a jobs program.", "sly"),
        L("Senator, that's enough Constitution for one loss.", "soft"),
        L("The zodiac did not see the working class coming.", "sly"),
        L("Filibuster this.", "hot")
      ),
      rfk: H(
        L("I am once again asking you to sit down, Bobby.", "hot"),
        L("You used to knock doors with me. Then you knocked us.", "sly"),
        L("Kid, I was in this fight before your frog slides.", "soft"),
        L("The movement doesn't need a cabinet skeptic.", "sly"),
        L("Vermont just outlived a Kennedy. That's new.", "hot")
      ),
      vance: H(
        L("Venture capital won't save you.", "hot"),
        L("I knew Appalachia before the book deal.", "sly"),
        L("J.D., the plants needed unions, not memoirs.", "sly"),
        L("Sit, young man.", "soft"),
        L("The working class just edited your elegy.", "hot")
      ),
      desantis: H(
        L("Florida man, meet Vermont justice.", "hot"),
        L("Socialism suns just fine, Ron.", "sly"),
        L("Governor, the people are bigger than a statute.", "soft"),
        L("Woke? I was woke in 1963.", "sly"),
        L("Your state bans books. I just banned you.", "hot")
      ),
      maga: H(
        L("The working class just fired you.", "hot"),
        L("The hat is not a union card.", "sly"),
        L("Brother, you were lied to. Then you lost.", "soft"),
        L("Open carry, closed factory. I remember.", "sly"),
        L("I am once again asking you to drop the rifle.", "hot")
      ),
    },
  },
  schumer: {
    vs: {
      trump: H(
        L("New York remembers. And forgets you.", "hot"),
        L("Fifth Avenue just evicted its favorite tenant.", "sly"),
        L("Donald, the city's had enough.", "soft"),
        L("I have the floor. You have a mugshot.", "sly"),
        L("You're adjourned from my island.", "hot")
      ),
      melania: H(
        L("Fifth Avenue just evicted you.", "hot"),
        L("The castle is in foreclosure.", "sly"),
        L("Ma'am, that's a wrap on the quiet luxury.", "soft"),
        L("I do not yield to the balcony.", "sly"),
        L("New York keeps the rent. Not the royals.", "hot")
      ),
      mcconnell: H(
        L("Leader to leader. I win.", "hot"),
        L("The other aisle just ended.", "sly"),
        L("Mitch, we used to count votes. I counted you out.", "soft"),
        L("Cloture. On the turtle.", "sly"),
        L("Thirty years. One New Yorker. Done.", "hot")
      ),
      rubio: H(
        L("Marco, the majority just moved.", "sly"),
        L("Little Marco, big apple ending.", "hot"),
        L("Drink water in Brooklyn, kid.", "soft"),
        L("Florida can keep the humidity. I'll keep the floor.", "sly"),
        L("I will not yield. You already did.", "hot")
      ),
      cruz: H(
        L("I will not yield. You already did.", "hot"),
        L("Ted, Cancun is not in my whip count.", "sly"),
        L("Senator, that's enough Texas for one day.", "soft"),
        L("The Constitution is not a boarding pass.", "sly"),
        L("Filibuster over. Schumer still talking. You're not.", "hot")
      ),
      rfk: H(
        L("Bobby, New York remembers the name. Not the turn.", "hot"),
        L("You took the cabinet. I took the square.", "sly"),
        L("That's enough lectures, secretary.", "soft"),
        L("The machine doesn't do MAHA. It does endings.", "sly"),
        L("Hyannis is a long way from this board.", "hot")
      ),
      vance: H(
        L("The Senate just got younger. And emptier.", "sly"),
        L("J.D., the heartland can keep the book.", "soft"),
        L("Yale boy, this is the real chamber.", "hot"),
        L("I have the votes. You have a hardcover.", "sly"),
        L("Ohio, your freshman is finished.", "hot")
      ),
      desantis: H(
        L("Bring it to the floor. Oh wait.", "sly"),
        L("Governor, this isn't Tallahassee.", "hot"),
        L("Ron, take it up with my whip.", "soft"),
        L("Disney lost a fight. You lost the building.", "sly"),
        L("Florida man, majority leader.", "hot")
      ),
      maga: H(
        L("The base is not the Senate. I am.", "hot"),
        L("The hat is not recognized.", "sly"),
        L("Sir, the gallery is that way.", "soft"),
        L("Open carry is not a motion.", "sly"),
        L("I have the floor. You have an exit.", "hot")
      ),
    },
  },
  harris: {
    vs: {
      trump: H(
        L("That debate was practice.", "hot"),
        L("I'm speaking. You're leaving.", "sly"),
        L("Donald, that's enough.", "soft"),
        L("Unburdened by what has been. Namely you.", "sly"),
        L("Prosecutor. Case closed. Next defendant.", "hot")
      ),
      melania: H(
        L("I'm speaking. You're leaving.", "hot"),
        L("The pearls outlast the ice.", "sly"),
        L("Ma'am, the photo op is over.", "soft"),
        L("Quiet luxury, loud ending.", "sly"),
        L("I was a prosecutor. You were a pose.", "hot")
      ),
      mcconnell: H(
        L("I was a prosecutor. Case closed.", "hot"),
        L("The turtle just met a DA.", "sly"),
        L("Senator, the people have been.", "soft"),
        L("Cloture? Conviction.", "sly"),
        L("Thirty years is a long rap sheet.", "hot")
      ),
      rubio: H(
        L("Unburdened by what has been. You.", "sly"),
        L("Drink water, Marco. Then the Miranda.", "hot"),
        L("That's enough, senator.", "soft"),
        L("Florida man, California prosecutor.", "sly"),
        L("Little Marco, big indictment of the square.", "hot")
      ),
      cruz: H(
        L("The people who have been... gone.", "sly"),
        L("Ted, Cancun is not a defense.", "hot"),
        L("Senator, I know the record.", "soft"),
        L("Originalism is not an alibi.", "sly"),
        L("The jury of this board just convicted.", "hot")
      ),
      rfk: H(
        L("Bobby, I know a bad diagnosis when I see one.", "hot"),
        L("The worm is not a character witness.", "sly"),
        L("Secretary, that's a wrap on the hearings.", "soft"),
        L("I'm speaking. You're a footnote in HHS.", "sly"),
        L("Unburdened by RFK. Finally.", "hot")
      ),
      vance: H(
        L("What can be, unburdened by Vance.", "sly"),
        L("Yale law. My courtroom.", "hot"),
        L("J.D., that's enough memoir.", "soft"),
        L("The elegy is evidence.", "sly"),
        L("Ohio, your senator just got crossed.", "hot")
      ),
      desantis: H(
        L("Don't come for me. I came for you.", "hot"),
        L("Governor, that's not how prosecutions work.", "sly"),
        L("Ron, stay in your state. In the past.", "soft"),
        L("Your statute is hearsay here.", "sly"),
        L("Florida man, meet a California case.", "hot")
      ),
      maga: H(
        L("That hat is evidence. And you're convicted.", "hot"),
        L("I'm speaking. The hat isn't.", "sly"),
        L("Sir, that's enough rally.", "soft"),
        L("Open carry, closed case.", "sly"),
        L("The people who have been... have been enough of you.", "hot")
      ),
    },
  },
  warren: {
    vs: {
      trump: H(
        L("Two cents on every dollar. One square on you.", "hot"),
        L("I have a plan for that. It ends with you.", "sly"),
        L("Donald, that's enough pretending.", "soft"),
        L("Show me the returns. Oh. Goodbye.", "sly"),
        L("Nevertheless, she collected.", "hot")
      ),
      melania: H(
        L("Show me your tax returns. Oh. Goodbye.", "sly"),
        L("I have a plan for vacant castles.", "hot"),
        L("Ma'am, the audit is over.", "soft"),
        L("Quiet luxury is still luxury. I tax it.", "sly"),
        L("Many houses. One vacancy.", "hot")
      ),
      mcconnell: H(
        L("The consumer is protected. From you.", "hot"),
        L("Your obstruction just got a CFPB file.", "sly"),
        L("Mitch, the memo is in.", "soft"),
        L("Nevertheless, the turtle loses.", "sly"),
        L("Thirty years is a predatory practice.", "hot")
      ),
      rubio: H(
        L("I have a plan for Marco. It's short.", "sly"),
        L("Little Marco, big fine print.", "hot"),
        L("Drink water. Read the plan.", "soft"),
        L("Florida man, Massachusetts math.", "sly"),
        L("The plan has twelve points. You are not one.", "hot")
      ),
      cruz: H(
        L("The CFPB just opened a file. Closed it.", "sly"),
        L("Ted, Cancun is not a deduction.", "hot"),
        L("Senator, that's not how consumer law works.", "soft"),
        L("Originalism isn't a loophole here.", "sly"),
        L("Nevertheless, the statute wins.", "hot")
      ),
      rfk: H(
        L("I will persist. Your worm will not.", "hot"),
        L("Bobby, I have a plan. Step one is you gone.", "sly"),
        L("Secretary, that's enough Facebook science.", "soft"),
        L("Nevertheless, she booked the Kennedy.", "sly"),
        L("Two cents. Zero secretaries left.", "hot")
      ),
      vance: H(
        L("Yale taught us both. I passed.", "hot"),
        L("I have a plan for memoirs. It's an ending.", "sly"),
        L("J.D., that's a draft. I filed the final.", "soft"),
        L("The elegy needed a regulator.", "sly"),
        L("Ohio, your freshman failed the exam.", "hot")
      ),
      desantis: H(
        L("I have a plan for Florida. Evacuation.", "hot"),
        L("Your statute is a predatory product.", "sly"),
        L("Governor, that's not enforceable.", "soft"),
        L("Nevertheless, Massachusetts.", "sly"),
        L("Woke isn't dead. Your rule is.", "hot")
      ),
      maga: H(
        L("The machine is the people. You're a spare part.", "hot"),
        L("The hat is not a financial product I approve.", "sly"),
        L("Sir, read the plan. Then sit.", "soft"),
        L("Open carry, closed account.", "sly"),
        L("I have a plan for that hat. It's a bin.", "hot")
      ),
    },
  },
  buttigieg: {
    vs: {
      trump: H(
        L("I learned from the Navy. You learned from TV.", "hot"),
        L("Infrastructure week. For your funeral.", "sly"),
        L("Sir, that's a briefing, not a rally.", "soft"),
        L("The trains run on time. You don't.", "sly"),
        L("Mayor of a real country. You're evicted.", "hot")
      ),
      melania: H(
        L("Malfunction at the intersection. Of you.", "sly"),
        L("The castle is not ADA compliant. For staying.", "hot"),
        L("Ma'am, that's a detour.", "soft"),
        L("Quiet luxury, loud road closure.", "sly"),
        L("I inspect bridges. Yours just failed.", "hot")
      ),
      mcconnell: H(
        L("Bridges out. Including yours.", "hot"),
        L("The turtle is a traffic hazard.", "sly"),
        L("Senator, that's a delay I can live with. You can't.", "soft"),
        L("Infrastructure week just paved you over.", "sly"),
        L("Thirty years of potholes. I filled the last one.", "hot")
      ),
      rubio: H(
        L("Spanish is fine. Your position isn't.", "sly"),
        L("Little Marco, big roadblock.", "hot"),
        L("Drink water. Watch the lights change.", "soft"),
        L("Florida man, Department of Transportation.", "sly"),
        L("I speak seven languages. None of them is concession. Yours is.", "hot")
      ),
      cruz: H(
        L("The trains run on time. You don't.", "sly"),
        L("Cancun is not a transit hub.", "hot"),
        L("Ted, that's a missed connection.", "soft"),
        L("The Constitution is not a timetable.", "sly"),
        L("Filibuster delayed. I arrived.", "hot")
      ),
      rfk: H(
        L("Bobby, this exit. No layover.", "sly"),
        L("Secretary, that's a wrong turn at HHS.", "soft"),
        L("I inspect wellness. Yours failed.", "hot"),
        L("The airports were easier than you.", "sly"),
        L("Infrastructure of a dynasty, demolished.", "hot")
      ),
      vance: H(
        L("Ohio, your senator is delayed.", "sly"),
        L("Two Yales. One functioning transit system.", "hot"),
        L("J.D., the memoir missed its stop.", "soft"),
        L("Hillbilly elegy, municipal ending.", "sly"),
        L("I briefed worse rooms than this. You were one.", "hot")
      ),
      desantis: H(
        L("I debated better cities than your state.", "hot"),
        L("Your trains don't run. Mine just ran you over.", "sly"),
        L("Ron, that's a closed lane.", "soft"),
        L("Florida man, federal corridor.", "sly"),
        L("Woke isn't dead. Your on-ramp is.", "hot")
      ),
      maga: H(
        L("Keep your hands inside the ride. Forever.", "hot"),
        L("The hat is not DOT approved.", "sly"),
        L("Sir, that's a sidewalk.", "soft"),
        L("Open carry, closed station.", "sly"),
        L("Infrastructure week just paved the rally.", "hot")
      ),
    },
  },
  mamdani: {
    vs: {
      trump: H(
        L("Queens just outclassed Fifth Avenue.", "hot"),
        L("The rent is frozen. You aren't.", "hot"),
        L("Donald, that's enough noise.", "soft"),
        L("I take the subway. You take the L.", "sly"),
        L("City Hall stands. You don't.", "sly")
      ),
      melania: H(
        L("The castle just met a city that works.", "hot"),
        L("Ma'am, that's a wrap on the ice.", "soft"),
        L("I run a city. You run a balcony.", "sly"),
        L("Public housing just evicted a palace.", "hot"),
        L("Cold luxury, warm ending.", "sly")
      ),
      mcconnell: H(
        L("The turtle missed the last train.", "hot"),
        L("I object to thirty years of this.", "sly"),
        L("Mitch, sit with me. Then sit down.", "soft"),
        L("The Senate just got a subway. Lost a turtle.", "sly"),
        L("City Hall vs. the gavel. Guess who stood.", "hot")
      ),
      rubio: H(
        L("Brother Marco, this is the end.", "sly"),
        L("Drink water. Drink this loss.", "soft"),
        L("Little Marco, big Queens.", "hot"),
        L("I speak buses. You speak humidity.", "sly"),
        L("Florida man, New York soul.", "hot")
      ),
      cruz: H(
        L("I object to your existence on this square.", "hot"),
        L("Ted, Cancun is not a community.", "sly"),
        L("Senator, that's enough law-talk.", "soft"),
        L("The Constitution is not a beach towel.", "sly"),
        L("Queens overruled Texas.", "hot")
      ),
      rfk: H(
        L("We can disagree. Not with a Kennedy who switched.", "hot"),
        L("Bobby, the clip expired. So did the brand.", "sly"),
        L("Secretary, sit. Queens is speaking.", "soft"),
        L("I kept the left. You rented the right. Neither saved you.", "sly"),
        L("Free buses. Toll booth for dynasties.", "hot")
      ),
      vance: H(
        L("Couch to coast. Out.", "sly"),
        L("J.D., I did the city. You did the book.", "hot"),
        L("That's enough elegy, senator.", "soft"),
        L("Yale boys can sit. This one takes the 7.", "sly"),
        L("Ohio, your freshman met a mayor of five boroughs.", "hot")
      ),
      desantis: H(
        L("Florida, New York sends a message.", "hot"),
        L("Ron, I don't ban books. I end chapters.", "sly"),
        L("Governor, that's enough statute.", "soft"),
        L("Woke? I call it a city. You just lost to it.", "sly"),
        L("City Hall vs. Tallahassee. Easy.", "hot")
      ),
      maga: H(
        L("The hat is not a metrocard.", "hot"),
        L("Open carry, closed station.", "sly"),
        L("Brother, you can do better. You didn't.", "soft"),
        L("This city just cancelled the rally.", "sly"),
        L("Queens just took the square.", "hot")
      ),
    },
  },
  activist: {
    vs: {
      trump: H(
        L("Eat the rich. Start at the king.", "hot"),
        L("Your tower is a haunted house.", "sly"),
        L("Okay boomer-in-chief.", "soft"),
        L("The resistance just collected a scalp. A weave.", "sly"),
        L("You're not hired. You're compost.", "hot")
      ),
      melania: H(
        L("Your silence was loud. This is louder.", "hot"),
        L("That jacket was the confession.", "sly"),
        L("Ma'am, the castle's evicted.", "soft"),
        L("I really do care. That's why you're gone.", "sly"),
        L("Quiet luxury, loud revolution.", "hot")
      ),
      mcconnell: H(
        L("OK boomer. Turtle edition.", "hot"),
        L("The 90s called. They want their villain back.", "sly"),
        L("Sit down, grandpa.", "soft"),
        L("Your gavel is a relic. So are you.", "sly"),
        L("The gallery just rushed the floor.", "hot")
      ),
      rubio: H(
        L("Drink water. Choke on it.", "hot"),
        L("Little Marco, big protest.", "sly"),
        L("Hydrate and leave.", "soft"),
        L("Florida man vs. the future. Future.", "sly"),
        L("The water boy just got cancelled.", "hot")
      ),
      cruz: H(
        L("Zodiac's last sign: extinct.", "sly"),
        L("Cancun can't hide you from a comment section.", "hot"),
        L("Ted, go pack.", "soft"),
        L("Facts don't care about your boarding pass.", "sly"),
        L("The Constitution is not your Uber to safety.", "hot")
      ),
      rfk: H(
        L("Pick a side. You picked wrong, uncle.", "hot"),
        L("The worm is in the comments. They're mean.", "sly"),
        L("That's enough, Bobby.", "soft"),
        L("Raw milk, raw L.", "sly"),
        L("The protest brought a doctor. Then fired him.", "hot")
      ),
      vance: H(
        L("Weird is not a strategy.", "hot"),
        L("The memoir just got ratio'd.", "sly"),
        L("J.D., go touch grass. Horizontal.", "sly"),
        L("Yale boy, street ending.", "soft"),
        L("Hillbilly elegy, comment-section coda.", "hot")
      ),
      desantis: H(
        L("Don't say gay. Don't say anything.", "hot"),
        L("Your statute just met a protest.", "sly"),
        L("Ron, that's a campus. I win those.", "soft"),
        L("Woke isn't dead. You just got educated.", "sly"),
        L("Florida man, meet the group chat.", "hot")
      ),
      maga: H(
        L("I am aborting you now!", "hot"),
        L("Your hat is a hate crime against fashion.", "sly"),
        L("Sit down, uncle.", "soft"),
        L("This is what the resistance looks like.", "sly"),
        L("Eat the rich. Start with the hat.", "hot")
      ),
    },
  },
};

const EDIT_KEY = "floor-vote-kill-lines-v2";

function edits() {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EDIT_KEY) || "{}") || {};
  } catch (e) {
    return {};
  }
}

function writeEdits(all) {
  localStorage.setItem(EDIT_KEY, JSON.stringify(all));
}

export function matchKey(killerId, victimId) {
  return killerId + ":" + victimId;
}

export function isFilmed(killerId, victimId) {
  return !!FILMED[matchKey(killerId, victimId)];
}

export function hooksFor(killerId, victimId) {
  const pack = LINES[killerId];
  if (!pack) return [];
  const raw = (victimId && pack.vs && pack.vs[victimId]) || pack.default || [];
  return raw.map((item, i) => ({
    i: i,
    text: item.text,
    heat: item.heat,
  }));
}

export function proposedLine(killerId, victimId) {
  const hooks = hooksFor(killerId, victimId);
  return hooks[0] ? hooks[0].text : null;
}

export function selectedIndex(killerId, victimId) {
  const row = edits()[matchKey(killerId, victimId)];
  if (!row) return 0;
  if (typeof row.i === "number") return row.i;
  return -1;
}

export function lineFor(killerId, victimId) {
  const row = edits()[matchKey(killerId, victimId)];
  if (row && row.text) return row.text;
  const hooks = hooksFor(killerId, victimId);
  const i = row && typeof row.i === "number" ? row.i : 0;
  return hooks[i] ? hooks[i].text : proposedLine(killerId, victimId);
}

export function pickHook(killerId, victimId, index) {
  const all = edits();
  const key = matchKey(killerId, victimId);
  if (index === 0) delete all[key];
  else all[key] = { i: index };
  writeEdits(all);
  return lineFor(killerId, victimId);
}

export function saveLine(killerId, victimId, text) {
  const all = edits();
  const key = matchKey(killerId, victimId);
  const next = (text || "").trim();
  const hooks = hooksFor(killerId, victimId);
  const hit = hooks.find((h) => h.text === next);
  if (!next || (hit && hit.i === 0)) delete all[key];
  else if (hit) all[key] = { i: hit.i };
  else all[key] = { text: next };
  writeEdits(all);
  return lineFor(killerId, victimId);
}

export function resetLine(killerId, victimId) {
  const all = edits();
  delete all[matchKey(killerId, victimId)];
  writeEdits(all);
  return proposedLine(killerId, victimId);
}

export function isEdited(killerId, victimId) {
  const row = edits()[matchKey(killerId, victimId)];
  return !!(row && row.text);
}

export function allMatchups(entries) {
  const right = entries.filter((e) => e.color === "w");
  const left = entries.filter((e) => e.color === "b");
  const out = [];
  right.forEach((k) => {
    left.forEach((v) => {
      out.push({ killer: k, victim: v });
    });
  });
  left.forEach((k) => {
    right.forEach((v) => {
      out.push({ killer: k, victim: v });
    });
  });
  return out;
}
