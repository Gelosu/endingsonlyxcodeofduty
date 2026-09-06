export type Letter = {
  slug: string;
  name: string;
  body: string;
};

export const letters: Letter[] = [
  {
    slug: "daniel",
    name: "Daniel",
    body: `Dear Daniel, Gelo here. Kamusta ka? Thank you pala Daniel for being one of my pips and in our team. I appreciate your feedbacks before and i love how you were able to help us out sa graphic designs kasi tamad ako dyan hahahaha. Thanks din for being one of my friend, especially you help us out throughout this journey. Hope your doing well din sa current work or freelancing job mo and no worries, i believe that one day is papaldo tayo lahat hahah. Keep up bro! Btw about dun sa game might come back soon to progress again once i have my own pc soon. i let you know the update if meron na hehe. Keep safe and ride safe Daniel

- Gelo`,
  },
  {
    slug: "jiann",
    name: "Jiann",
    body: `Dear Jiann, this might be a long letter for you hehe. Thank you for being my friend, my partner sa mcdo journey natin dun, and as one of my teammate as well. To be honest, while im doing this web app i was thinking to write all of you guys a letter but yeah ahahh welcome to the digital world. I just want you to know that, im shy ahah char. I dont know how to say this to you pero your the special one i had lost if you know what i mean. The moment na may sinabi ka sa amin nung kasama sina cj and ralph, Alam mo ba my eyes there is kinda sobby pero aun. i want you to know that actually i have a feelings from you from the very start nung college natin. I'm sorry if di ko napansin na may signal to start na pala and i should have seen that. Pero ayun, im happy naman na kasi nandyan na si Selwyn for you and i believe he took care of you and love you more. I know that we won't be able to return back to time pero this is true. Kaya on your Dubai Journey soon, always keep safe and enjoy din and alam ko kaya mo yan kasi kinaya natin during MCDO days. Thank you Jiann again, for being special in my heart even friends tayo now. Hope you appreciate all the efforts i made throughout kahit busy hahah. Ingats and if you need any help, chat mo lang ako ah and i'll try to accomodate it if ever. Von Voyage

- Gelo`,
  },
  {
    slug: "gilo",
    name: "Gilo",
    body: `Dear Gilo, thank you ah laki tulong mo during our journey especially namumultitask mo ung mga bagay bagay kapag wala me or during my shift sa mcdo. i salute all your efforts and i appreciate how kind and helpful you are kahit matahimik din haha. Kamusta ka? hope your doing well din sa career and journey mo especially solid and ang laki ng potential mo bro. Thank you for being one of my team and my friend as well throughout our college journey. Aabot din tayo soon sa paldo era hehe. Laban lang Gilo

- Gelo`,
  },
  {
    slug: "tristan",
    name: "Tristan",
    body: `Dear Tristan, my pips. Hope your doing well in your life despite of what happen nowadays in your journey. Always remember na you can always move forward despite the obstacles in your way. Thank you pala during our college as one of the programmer natin sa thesis, you've contribute a lot din especially di naman talga me magaling sa ganun hahahahaha until now. Nagpapasalamat ako kasi i appreciate our moments kapag nag call ka and i really appreciate yung kamustahan mo. I know matagal na rin tayo di nagkikita pero one thing for sure is that i can help you and ill try to accomodate it sa aking makakaya. Thanks sa lahat ah and may you get back again sa paldong era. Tiwala lang pips.

- Gelo`,
  },
  {
    slug: "lester",
    name: "Lester",
    body: `Dear Lester, hi bro and pips ahhaha. Thank you for being one of my solid friend and tandem during the coding era haha. i appreciate all our journey and im very proud to you that you've made it so far na. I hope your doing well and don't forget din magpahinga ahhhhh. Thank you ter, kasi never mo ako binigo and it's like our minds join together kapag talaga usapang tech ahhaha. Hope your doing well sa journey mo and i love the way that despite your busy time day din ay nagagawa mo sumama sa ating agenda for today. Thanks Ter and soon papaldo era din tayong lahat haha.

- Gelo`,
  },
  {
    slug: "janella",
    name: "Janella",
    body: `Dear Janella, Hi and kamusta ka? Congrats pala and graduate ka din ey. Sorry if i can't help your team their during our college era but for now i just want to let you know that im proud to you as well at nakapagtapos ka na rin. All your hardworks reflect who you are and keep up lang always. i appreciate you for being one of our influencer friends during college ahha especially sa MCDO or Jollibee man yan na purgang purga na tayo. Thank you for being one of my friend and soon once na aalis ka na rin sa Pilipinas, always remember to keep safe and enjoy and embrace your journey their soon. Maybe it's not now but soon. Laban lang and aabot din tayo sa paldong era.

- Gelo`,
  },
];

export function findLetter(name: string): Letter | undefined {
  const s = name.trim().toLowerCase();
  return letters.find((l) => l.slug === s);
}
