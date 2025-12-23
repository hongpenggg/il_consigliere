#############
#  Presets  #
#############

import time

families = {
    "Italy": ["Famiglia del Brenta", "Banda della Comasina", "Banda della Magliana", "Famiglia Cosentino", "Sacra Corona Unita", "La Ndrangheta", "La Camorra", "La Cosa Nostra"],
    "US": ["Famiglia Gambino","Famiglia Lucchese","Famiglia Genovese","Famiglia Bonanno","Famiglia Colombo",],
    "Britain": ["Peaky Blinders"]
}


###################
#  World-Building #
###################


class World:
  def __init__(self, name, mode, country):
    print("")
    print("Initialising your mafia world ...")
    self.name = name
    self.mode = mode
    self.country = country
    self.families = families
    self.family = None

    print("")
    print(f"Welcome to the mafia world in {country}, {name}.")
    print("")

  def set_family(self):
    if self.country == "Italy":
      print("")
      print("Pick a powerful family to side with: ")
      print("1. Famiglia del Brenta, in Veneto.")
      print("2. Banda della Comasina, in Lombardy.")
      print("3. Banda della Magliana, in Lazio.")
      print("4. Famiglia Cosentino, in Basilicata.")
      print("5. Sacra Corona Unita, in Apuila.")
      print("6. La Ndrangheta, in Calabria.")
      print("7. La Camorra, in Campania.")
      print("8. La Cosa Nostra, in Sicily.")

      pick = int(input("Your family: "))
      self.family = families["Italy"][pick-1]
      print("")

    elif self.country == "US":
      print("")
      print("Pick a powerful family to side with: ")
      print("1. Famiglia Gambino, in New York.")
      print("2. Famiglia Lucchese, in New York.")
      print("3. Famiglia Genovese, in New York.")
      print("4. Famiglia Bonanno, in New York.")
      print("5. Famiglia Colombo, in New York.")

      pick = int(input("Your family: "))
      self.family = families["US"][pick-1]
      print("")

  def get_family(self):
    return self.family
  
  def map(self, pick):
    map_1 = '''
                    Lombardy
                        |
                        |
                        |                         ▓▓                                                
                                            ████████▓▓                                              
                                      ▓▓▓▓██████▒▒██▓▓                                              
                    ▓▓██░░  ▒▒      ▒▒░░░░░░░░░░░░██████░░                                          
                  ░░░░██░░░░▓▓████░░░░░░░░░░░░░░░░░░░░████████                                      
        ░░░░░░░░░░░░░░██▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                      
      ▒▒██████▓▓▓▓░░░░▓▓██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓                                      
    ░░░░░░░░░░░░░░░░░░▓▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓██▒▒                                    
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████                                    
    ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒                                    
    ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ░░░░                                      
  ░░▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      |                                        
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▒▒    |                                        
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒██▓▓    |--------- Veneto                                        
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                              
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██▓▓                                              
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓██▓▓                                            
        ░░░░░░░░░░░░        ░░░░░░░░░░░░░░░░░░░░░░░░▓▓██░░                                          
        ░░░░░░░░                ░░░░░░░░░░░░░░░░░░░░░░████▓▓                                        
                                  ░░░░░░░░░░░░░░░░░░░░░░▒▒▓▓▓▓                                      
                                  ░░░░░░░░░░░░░░░░░░░░░░░░▒▒██                                      
                                  ░░░░░░░░░░░░░░░░░░░░░░░░░░██                                      
                                  ░░░░░░░░░░░░░░░░░░░░░░░░░░██▒▒                                    
                                    ░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓                                    
                                    ░░░░░░░░░░░░░░░░░░░░░░░░▓▓████                                  
                                      ░░░░░░░░░░░░░░░░░░░░░░░░░░██▒▒                                
                                        ░░░░░░░░░░░░░░░░░░░░░░░░████▓▓                        Apuila    
                                          ░░░░░░░░░░░░░░░░░░░░░░░░▓▓██                         /     
                                            ░░░░░░░░░░░░░░░░░░░░░░░░████████▓▓                /      
                    ░░░░  ░░░░      ░░░░░░░░░░░░▒▒▒▒░░▒▒░░▒▒▒▒▒▒░░▒▒░░░░▒▒▒▒▓▓░░░░           /       
                          ░░  ▒▒░░  ░░        ░░░░░░░░░░░░░░░░▒▒░░▒▒░░░░░░░░████▓▓          /        
                      ░░  ▒▒▓▓░░░░  ░░        ░░  ░░░░░░░░░░▒▒▒▒░░░░░░▒▒░░░░░░▓▓██▓▓▒▒░░   /         
                  ░░░░  ░░▓▓▓▓██  ░░            ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████▒▒          
                ▒▒████░░░░░░▓▓████            |             ░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓████        
              ░░░░░░░░░░░░░░░░▓▓▓▓            |               ░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓████      
              ░░░░░░░░░░░░░░░░▓▓▓▓            |                 ░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓▓▓▓▒▒  
                ░░░░░░░░░░░░░░▓▓▒▒            |                 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██▓▓  
                  ░░░░░░░░░░▒▒██            Lazio                  ░░░░░░░░░░░░░░▒▒  ░░░░░░░░▓▓██  
                  ░░░░░░░░░░▓▓▓▓                                /   ░░░░░░░░░░░░░░██   \   ░░░░░░    
                ░░░░░░░░░░░░▓▓                                 /        ░░░░░░░░░░▓▓██  \           
                ░░░░░░░░░░░░██                                /            ░░░░░░░░██████ \          
                ░░░░░░░░░░░░██                          Campania           ░░░░░░░░▓▓██  \         
                ░░░░░░░░░░░░░░                                              ░░░░░░░░░░██   \        
                ░░░░░░▒▒░░                                                  ░░░░░░░░░░██  Basilicata       
                  ░░░░                                                        ░░░░░░░░              
                  ░░░░                                                      ░░░░░░▒▒░░  \            
                                                      ░░░░            ▒▒██░░░░░░▒▒░░     \           
                                                    ██████████▒▒░░  ▓▓░░██░░░░░░▓▓        \          
                                                  ░░░░░░░░░░██████░░░░░░██░░░░░░           Calabria          
                                                  ░░░░░░░░░░░░░░░░░░░░░░▓▓░░░░                    
                                                  ░░░░░░░░░░░░░░░░░░░░▒▒▓▓                        
                                                    ░░░░░░░░░░░░░░░░░░▒▒                          
                                                    ░░░░░░░░░░░░░░░░░░▒▒                            
                                                      ░░░░░░░░░░░░░░░░██                            
                                                          ░░░░░░░░░░░░██                            
                                                                ░░░░░░▒▒  ------------------- Sicily                          
                                                                  ░░░░                                                 

'''

    map_2 = "Not here yet!"
    
    if pick == 1:
      print(map_1)
    else:
      print(map_2)

  def display(self):
    print("")
    print(f"Your name is: {self.name}")
    print(f"You are playing {self.mode} mode.")
    print(f"You are the consigliere of the {self.family} family in {self.country}.")
    print("")


#############################
#  Guided Mode Helper Class  #
#############################


class Story:
  def __init__(self, name, country, family):
    print("")
    self.newStats = Stats()
    print("")
    print("Initialising your story ...")

    self.name = name
    self.country = country
    self.family = family

    print(f"Welcome to {country}, {name}.")
    print(f"You are now the Consigliere of the {family} family.")
    print("")

  def c0(self):
    print("")
    print("====================")
    print("CHAPTER 0")
    print("====================")
    print("")

    print("Here's what you'd learn in the next few chapters:")
    print("1. Intro to the game")
    print("2. Story objectives")
    print("3. Power and Wealth")
    print("4. Armies")
    print("5. Relationships")
    print("6. Maps and Regions")
    print("7. War and Conquest")
    print("8. Business. All's Good.")
    print("9. Head start to your game.")
    print("10. Try to beat the boss.")

    print("")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")


  def c1(self):
    print("")
    print("============================")
    print("CHAPTER 1: Intro to the Game")
    print("============================")
    print("")

    print(f"BREAKING NEWS: The long-time consigliere of the {self.family} family in {self.country}, Lorenzo Bianchi, has died in mysterious circumstances.")
    print(f"Multiple media outlets and news sources report that he died of cancer.")
    print(f"However, insider sources in the {self.family} family have hinted at assassination.")
    print(f"Bianchi will be succeeded as consigliere by a young upstart, {self.name}, who has risen quickly in the family since joining in 2020.")
    print("")
    check = input("Type anything or click enter to continue: ")
    print("")

    print(f"RICCI: You should not listen to the paparazzi, my Sig. \nAh, I forgot to introduce myself - Welcome, Sig {self.name}. I am Francesco Ricci, your advisor.")
    print("GAME TIPS: Your advisor will advise you in-game with tips and tricks. You can choose to listen or ignore them.")
    print(f"RICCI: You should not listen to the media outlets. I am sure you had nothing to do with Sig Bianchi's death.")
    print("")
    print("YOU: \n1. You are right, Sig Ricci. I loved Sig Bianchi like a father. \n2. Thank you, Sig Ricci. I will not heed these comments.")
    reply = input("Your choice: ")
    if reply == "1":
      print(f"YOU: You are right, Sig Ricci. I loved Sig Bianchi like a father.")
      self.newStats.familiarity[self.newStats.characters.index('Francesco Ricci')] += 1
    elif reply == "2":
      print(f"YOU: Thank you, Sig Ricci. I will not heed these comments.")
      self.newStats.familiarity[self.newStats.characters.index('Francesco Ricci')] += 1
    else:
      print("Although that wasn't a valid response, Sig Ricci seems not to have taken notice.")
      self.newStats.familiarity[self.newStats.characters.index('Francesco Ricci')] += 1
    print("")

    print(f"RICCI: Let me introduce you to the game, Sig {self.name}.")
    print("")
    check = input("Type anything or click enter to continue: ")
    print("")

    print(f"First of all, here are the people you know: {self.newStats.characters}")
    print("")
    print(f"Familiarity is how close you are with the people you know. \nThe more familiar you are with them, the likelier they are to collaborate with you. \nThey can range from 0(not close at all) to 100(very close).")
    print(f"Here is how familiar you are with the people you know: {self.newStats.familiarity}")
    print("")
    print(f"Loyalty is how loyal the people you know are with you. \nThe less loyal they are, the more likely they will betray you. \nThey can range from -100(very disloyal) to 100(very loyal).")
    print(f"Here are how loyal they are: {self.newStats.loyalty}")
    print("")
    print("Here, try it out. Type 'characters', or 'familiarity' or 'loyalty' to print it out. When you're done, just hit 'enter'")
    while True:
      test = input("What to print: ")
      if test == "characters":
        print(self.newStats.characters)
      elif test == "familiarity":
        print(self.newStats.familiarity)
      elif test == "loyalty":
        print(self.newStats.loyalty)
      else:
        print("Moving on!")
        break
    print("")

    print("Well then, that leaves us with the other aspects of the game.")
    print(f"Your power is your influence in your region and family. \nThe higher your power, the more ability you have to make people do as you want.")
    print(f"Power can be increased by acquiring more wealth or armies. \nPower can range from 1(less powerful) to 100(most powerful).")
    print(f"Your power: {self.newStats.power}")
    print("")
    print(f"Your wealth is how much money you have. \nThe richer you are, the more you can bribe officials and buy powerful mercenary armies. \nMoney can range from 1(poor) to 100(very rich).")
    print(f"Your wealth: {self.newStats.wealth}")
    print("")
    print("Here, try it out. Type 'power', or 'wealth' to print it out. When you're done, just hit 'enter'")
    while True:
      test = input("What to print: ")
      if test == "power":
        print(self.newStats.power)
      elif test == "wealth":
        print(self.newStats.wealth)
      else:
        print("Carrying on!")
        break
    print("")

    print("Armies can be used to enforce your will. Great mafia leaders often are rich and bankroll large mercenary armies.")
    print("There are many types of armies: mercenary(who fight for money), core(who fight for you out of loyalty) and family(who fight for your family).")
    print("You can acquire the first by paying up. The second requires time, and patience. Slowly, people loyal to you will build an army for you. The third, requires leadership of the house/family.")
    print("Each army is counted as 1 strength. The more units you have, the stronger you will be. \nNo surprise then, that armies increase your power significantly.")
    print(f"Your armies: {self.newStats.army}")
    print("")
    print("Here, try it out. Type 'army' to print it out. When you're done, just click 'enter'")
    while True:
      test = input("What to print: ")
      if test == "army":
        print(self.newStats.army)
      else:
        print("Steaming ahead!")
        break
    print("")

    print("RICCI: Well done! \nIn this chapter, you learnt the basics of the game. \nNext, we will learn about story objectives.")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")
    print("")

  def c2(self):
    print("")
    print("===========================")
    print("CHAPTER 2: Story Objectives")
    print("===========================")
    print("")

    print("In this chapter, we will learn all about story objectives, which form the basis of story mode. ")
    print("Every story starts with a compelling problem, powerful enemies and underlying objectives.")
    print("The difference between story mode and career mode, hence, is that in story mode, you follow the story and try to complete the objectives, while in career mode, you are free to roam, build your own empire as you like and rule the world.")
    print("However, for the purposes of this chapter, let's focus on story mode objectives.")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")

    print("RICCI: Objectives are like goals. In story mode, to win you must hit as many objectives as possible.")
    print("RICCI: They can include things like: [Assemble 10 armies] or [Be the head of family] or [Conquer 2 neighbouring regions]. ")
    print("RICCI: Objectives will be given different weights. For example, if being the head of family has 30 weightage, while assembling armies has 20, you should complete the one with higher weightage for maximum chance of winning.")
    print("RICCI: You win when you complete a number of objectives that add up to a total weightage, like 100 or 200. You will need to complete multiple objectives to total up.")
    print("RICCI: Also, objectives are not permanent. If assembling 10 armies is an objective and you attain it, but later on lose an army, you will need to hit 10 again to get the weightage.")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")

    print("RICCI: Let's try something!")
    print("You will try to hit a total of 100 weightage.")
    print("")

    total = 0

    print("Behind the objectives are their weightage.")
    print("Let's say a task is: [Conquer Lombardy, 1 sec, 50] - Type 'Lombardy Lombardy Lombardy'...")
    print("You can complete it by doing what it says: e.g. Typing 'Lombardy Lombardy Lombardy' into the box when it says type 'Lombardy' 3 times. ")
    print("And voila, you'll gain the 50 objective points!")
    print("")

    print("The following are objectives you can try to hit: ")
    print("1. [Assemble 5 armies, 2 secs, 20] - Type 'army army'")
    print("2. [Improve relationships with RICCI, 3 secs, 30] - Type 'ricci ricci ricci'")
    print("3. [Conquer 2 neighbouring regions, 5 secs, 50] - Type 'Apuila Calabria'")

    while total != 100:
      print("")
      print(f'Your total: {total}')
      tr = input("Complete the objectives: ")

      if tr == 'army army' or tr == 'armyarmy':
        print("Summoning the family... [0%]")
        time.sleep(1)
        print("Training the troops... [50%]")
        time.sleep(1)
        print("Purging the top brass... [100%]")
        print("Assembled 5 armies.")
        total += 20
        print("")
      elif tr == 'ricci ricci ricci' or tr == 'ricciricciricci':
        print("Calling Ricci for coffee... [0%]")
        time.sleep(1)
        print("Inviting Ricci to a dinner party in Palermo... [33%]")
        time.sleep(1)
        print("Promoting Ricci to Hand of the King... [66%]")
        time.sleep(1)
        print("Starting a heist with Ricci... [99%]")
        print("Improved relationship with Francesco Ricci.")
        total += 30
        print("")
      elif tr == 'Apuila Calabria' or tr == 'ApuilaCalabria' or tr == 'apuilacalabria' or tr == 'apuila calabria':
        print("Gathering the armies... [0%]")
        time.sleep(2)
        print("Summoning the generals... [40%]")
        time.sleep(2)
        print("Waging war... [80%]")
        time.sleep(1)
        print("Conquered Apuila and Calabria.")

        total += 50
        print("")
      else:
        print("Hmmm, that doesn't seem right ... Try again!")
        print("")

    print("")

    print("Now, let's try some harder objectives.")

    print("")
    print("The mafia life is all about being in control. Many bosses have extensive spy networks.")

    print("RICCI: Let's try starting our own spy network!")
    print("RICCI: Type 'spy' to start assembling your spy network. It will take 5 seconds.")

    flag = False
    while flag != True:
      a = input("Type 'spy' to start assembling your spy network: ")

      if a == 'spy':
        print("Hiring informants... [0%]")
        time.sleep(2)
        print("Bribing the mayor's secretary... [40%]")
        time.sleep(2)
        print("Assassinating clean officials... [80%]")
        time.sleep(1)
        print("Successfully assembled 'The Eyes'.")
        print()

        print("As you now control key information of your family and enemies, your power has increased.")
        self.newStats.set_power(self.newStats.get_power() + 1)
        print()

        c = input("When you're ready to move on, type anything or click enter to continue: ")
        print()
        flag = True

      else:
        print("Hmm, that doesn't seem right... Try again!")
        print()

    
    print("RICCI: Hmmm... You now have your own spy network. That's wonderful, but you need a little something... More!")
    print()
    print("""
YOU:
1. A little something more? What do you mean, Sig Ricci?
2. That's enough, Sig Ricci. I'm tired.""")
    while True:
      choice = input("Your choice: ")
      print()
      # hey, i'm what you're looking for!
      # [kwwsv://krqjshqjjj.jlwkxe.lr/mnmn6767/jdph-sdjhv/vrffhu.kwpo]
      # good luck!!

      if choice == '1':
        print(f"RICCI: I'm glad to hear that, Sig {self.name}!")
        print()
        break
      elif choice == '2':
        print("Don't disappoint Ricci!")
        print()
      else:
        print('What now?')
        print()
    
    print("RICCI: Let's build a vineyard! After all, wine is one of life's greatest joys.")
    print("1. [Build your vineyard, 2 secs, 20] - Type 'vineyard'...")
    flag = False
    while flag is not True:
      a = input("What are you building: ")

      if a == 'vineyard' or a == 'VINEYARD':
        print("Reviewing land prices... [0%]")
        time.sleep(1)
        print("Sourcing for the finest grapes... [50%]")
        time.sleep(1)
        print("Hiring true artisans... [100%]")
        print("Vineyard constructed!")
        print()
        flag = True
      else:
        print('Hmmm... Try again?')
        print()
    

    print("RICCI: That was incredible! You're the fastest learner I've seen!")
    print(f"RICCI: I'm sure you will lead the {self.family} family to new heights.")
    print("RICCI: Cheers to a new world!")
    print("")

    flag = False
    while flag is not True:
      a = input("When you're ready to move on to the next chapter, type anything or click enter to continue: ")
      flag = True
  

  def c3(self):
    print("")
    print("===========================")
    print("CHAPTER 3: Power and Wealth")
    print("===========================")
    print("")

    print("In this chapter, we will learn all about power and wealth, which make up some of the game objectives. ")
    print("Sometimes, a chapter in the story mode would have objectives like attaining a certain level of power or wealth.")
    print("It is then up to you on how you'll achieve the objectives.")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")

    print("As mentioned earlier, power is the amount of influence you have over your world.")
    print("The more power you have, the easier you'll find it to sway decision-makers and get things done your way.")
    print("Power manifests itself in different ways, and may affect your game, your options, and your endings.")
    print("But, as you'll see, power may bring with it some... Negative outcomes...")
    print("After all, as Signor Ben used to say: With great power, comes great responsibility!")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")

    print("Let's see what power can do!")
    print("RICCI: Try convincing the mayor to renew your casino license!")
    print()

    print(f"MAYOR: How can I help you, Sig {self.name}?")
    
    flag = False
    tries = 0
    while flag is not True:
      print("""
YOU:
1. Perhaps you can renew my Casino's license, Sig Mayor... [Ask nicely]
2. I demand you renew my license, mayor. [Demand the license]""")
      a = input("Your choice: ")

      if tries > 0:
        print()
        flag = True

      if a == '1':
        print("MAYOR: That would not be possible, Signor.")
        print("MAYOR: Unfortunately, it seems your casino would have to move. Or close down!")
        print()

        print("RICCI: And... CUT!")
        print("RICCI: I just found out that the mayor has entered into agreement with another family to build their own casino.")
        print("RICCI: It seems he doesn't respect you very much -- you don't have enough power to make him do what you say!")
        print("RICCI: You can try being more assertive, but I assure you it won't matter much.")
        print("RICCI: You have to increase your power!")
        print()
        tries += 1

      elif a == '2':
        print(f"MAYOR: What attitude, Sig {self.name}!")
        print("MAYOR: And anyway, the answer is no. Your casino has to close or move away, dear!")
        print("RICCI: Oh dear, it doesn't work.")
        print("RICCI: You could try being nicer, but I don't think it would make too much of a difference!")
        print("RICCI: Your power is simply too low to make him listen!")
        print()
        tries += 1

      else:
        print('Try again!')
    
    print("RICCI: Let's make this mayor listen!")
    print("1. [Kidnap the mayor's wife, 3 secs, +30 power] - Type 'kidnap'...")
    flag = False
    while flag is not True:
      a = input("You: ")

      if a == 'kidnap' or a == 'Kidnap' or a == 'KIDNAP':
        print("Planning with your lieutenants... [0%]")
        time.sleep(1)
        print("Training the hitcrew... [33%]")
        time.sleep(1)
        print("Fighting off her bodyguards... [66%]")
        time.sleep(1)
        print("Returning in victory... [99%]")
        time.sleep(0.2)
        print("You have kidnapped the mayor's wife!")
        print()
        flag = True
      else:
        print('Try again!')
        print()
        # flag, answer, key, link, move forward
        # HAHAHAHAHAH. Great try, but of course the key isn't labelled flag :)
        # also, because there's a lot of lists in the program, please don't go around searching for "[]"
        # really.

    print(f"MAYOR: Sig {self.name}! I'm so sorry...")
    print("MAYOR: Please let my wife go. I'll do anything!")
    print("""
YOU:
1. I like your new attitude, mayor. Renew my casino's license, and I'll let her go. [Demand license]
2. Hahahahahah. I like to see you beg, Sig Mayor. Do what I told you to do, and she'll be unharmed. [Demand license]
3. Too late, Sig Mayor! [Kill the hostage]""")
    flag = False
    while flag is not True:
      a = input("Your choice: ")

      if a == '1':
        print(f"MAYOR: You are right, Sig {self.name}. I shall do it right away.")
        print()
        flag = True
      elif a == '2':
        print(f"MAYOR: Please, Sig {self.name}. I will do what you say!")
        print()
        flag = True
      elif a == '3':
        print("RICCI: You cannot kill the hostage! She is your only hope at forcing this dirty mayor to agree.")
        print()
      else:
        print("Try again!")
        print()
  
    print("Your casino license has been renewed!")
    self.newStats.set_power(80)
    print("Your reputation as a strong leader has increased.")
    print("RICCI: You have gained a new acquantaince!")
    self.newStats.set_characters('Mayor', 1)
    self.newStats.set_loyalty('Mayor', 1)
    print(f"See? {self.newStats.get_characters()}")
    print()

    print("RICCI: You're truly on your way to greatness!")
    print()

    print("RICCI: Alright, now that we've had enough fun with power. Let us play with wealth!")
    print("Wealth is, quite simply, how much money and assets you have.")
    print("RICCI: Note that your personal wealth is not necessarily equal to your family's wealth.")
    print("RICCI: That's because your family's wealth would include the combined wealth of all its members.")
    print(f"RICCI: Anyway, Sig {self.name}, shall we?")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")

    print("RICCI: You can amass wealth in many different ways. You can make an investment, for example, and it might grow with the market.")
    print("RICCI: Or you might create a new avenue for money, like a casino or a brothel.")
    print("RICCI: There are also one-time ways to get money, that might be riskier, such as robbing the bank, or planning a heist.")
    print("RICCI: But, in my experience, the best ways to amass wealth are long-term. That is, they pay dividends over time.")
    print("RICCI: Racketeering (extortion as a business) for example.")
    print()

    print("Let's try it out!")
    print("Objective: Attain personal wealth of: 100")
    print(f"Current wealth: {self.newStats.get_wealth()}")
    print()

    print("""
YOU:
1. [Rob a bank, 2 secs, +10 wealth] - Type 'rob'
2. [Plan a Louvre Heist, 3 secs, +20 wealth] - Type 'heist'
3. [Stop a bank's armoured vehicle, 2 secs, +10 wealth] - Type 'vehicle'
4. [Start a Casino, 8 secs, +40 wealth] - Type 'casino royale'
5. [Start a brothel, 7 secs, +30 wealth] - Type 'lux the club'
6. [Start a racketeering front, 5 secs, +25 wealth] - Type 'al capone'
7. [Insider trading, 10 secs, +60 wealth] - Type 'stop that palantir'""")
    
    while self.newStats.get_wealth() < 100:
      a = input('Your choice: ')
      wealth = self.newStats.get_wealth()

      if a == 'rob' or a == 'Rob' or a == 'ROB':
        print("Laying the groundwork... [0%]")
        time.sleep(1)
        print("Threatening the attendants... [50%]")
        time.sleep(1)
        print("Making a get-away... [99%]")
        time.sleep(0.5)
        print("Attained 10 wealth!")
        self.newStats.set_wealth(wealth+10)
        print()

      elif a == 'heist' or a == 'Heist' or a == 'HEIST':
        print("Gathering storm... [0%]")
        time.sleep(1)
        print("Knocking out the guards... [33%]")
        time.sleep(1)
        print("Grabbing priceless artworks... [66%]")
        time.sleep(1)
        print("Black market yard sale... [99%]")
        time.sleep(0.5)
        print("Attained 20 wealth!")
        self.newStats.set_wealth(wealth+20)
        print()

      elif a == 'vehicle' or a=='Vehicle' or a=='VEHICLE':
        print("Making the perfect plan... [0%]")
        time.sleep(1)
        print("Hijacking the vehicle... [50%]")
        time.sleep(1)
        print("Making a quick get-away... [99%]")
        time.sleep(0.5)
        print("Attained 10 wealth!")
        self.newStats.set_wealth(wealth+10)
        print()

      elif a == 'casino royale' or a=='Casino Royale' or a=='casinoroyale' or a=='CASINO ROYALE':
        print("Finding the right location... [0%]")
        time.sleep(2)
        print("Bidding for land rights... [25%]")
        time.sleep(2)
        print("Purchasing slot machines... [50%]")
        time.sleep(2)
        print("House advantage... [75%]")
        time.sleep(2)
        print("Keeping the gamblers in... [99%]")
        time.sleep(0.5)
        print("Attained 40 wealth!")
        self.newStats.set_wealth(wealth+40)
        print()

      elif a == 'lux the club' or a=='Lux the Club' or a=='LUX THE CLUB' or a=='luxtheclub':
        print("Finding the right location... [0%]")
        time.sleep(2)
        print("Bidding for land rights... [25%]")
        time.sleep(2)
        print("Hiring the right people... [50%]")
        time.sleep(2)
        print("Night night... [75%]")
        time.sleep(1)
        print("No money, no fun... [99%]")
        time.sleep(0.5)
        print("Attained 30 wealth!")
        self.newStats.set_wealth(wealth+30)
        print()

      elif a == 'al capone' or a=='Al Capone' or a=='alcapone' or a=='ALCAPONE':
        print("Picking out targets... [0%]")
        time.sleep(2)
        print("Frightening the shopowners... [40%]")
        time.sleep(2)
        print("Hiring collectors... [80%]")
        time.sleep(1)
        print("Extorting unscrupulous shopowners... [99%]")
        time.sleep(0.5)
        print("Attained 25 wealth!")
        self.newStats.set_wealth(wealth+25)
        print()

      elif a == 'stop that palantir' or a=='Stop That Palantir' or a=='stopthatpalantir' or a=='stop that pltr' or a=='STOP THAT PALANTIR':
        print("Discussing with CEOs... [0%]")
        time.sleep(2)
        print("Little bit of research... [20%]")
        time.sleep(2)
        print("Getting the mayor to sign a deal... [40%]")
        time.sleep(2)
        print("Manipulating the media and market... [60%]")
        time.sleep(2)
        print("SELL SELL SELL... [80%]")
        time.sleep(2)
        print("Good grief, the money... [99%]")
        time.sleep(0.5)
        print("Attained 60 wealth!")
        self.newStats.set_wealth(wealth+60)
        print()

      else:
        print("Hmmm... That's not a valid businesss idea! Try again?")
        print()
    
    print()
    print("RICCI: Great. You have learnt all there is about wealth.")
    print("RICCI: Remember, however, in the real game, making choices have costs. Upfront, and after.")
    print("RICCI: For example, starting a casino might require 20 wealth as cost. If you are penniless, you won't be allowed to start the casino.")
    print("RICCI: Also, some choices might have requirements. For example, insider trading might require you to have familiarity of 4 with the mayor and a CEO.")
    print("RICCI: In game, you are usually limited to making one choice per turn. So try to be economical!")
    print("RICCI: Making choices to increase your power may also have wealth costs.")
    print()

    print("RICCI: Anyway, that's all for power and wealth.\nSee you in the next chapter!")
    print()
    print()

  
  def c4(self):
    pass





class Stats:
  def __init__(self):
    print("")
    print("Initialising game statistics ...")
    self.characters = ['Francesco Ricci']
    self.familiarity = [1]
    self.loyalty = [2]
    self.power = 50
    self.wealth = 50
    self.army = []

    print("")
    print(f"Your power: {self.power}")
    print(f"Your wealth: {self.wealth}")
    print(f"List of armies in your employment: {self.army}")
    print("")

  def set_characters(self, character, familiarity):
    if character.isalpha() and isinstance(familiarity, int):
      self.characters.append(character)
      self.familiarity.append(familiarity)
      self.loyalty.append(0)

  def set_loyalty(self,character, loyalty):
    if character in self.characters:
      if isinstance(loyalty, int):
        indice = self.characters.index(character)
        self.loyalty[indice] = loyalty

    elif character.isalpha() and isinstance(loyalty, int):
      self.characters.append(character)
      self.loyalty.append(loyalty)

  def get_loyalty(self):
    return self.loyalty

  def get_characters(self):
    return self.characters

  def get_familiarity(self):
    return self.familiarity

  def set_power(self,newPower):
    self.power = newPower
    print(f"Your power is now {self.power}.")

  def set_wealth(self,newWealth):
    self.wealth = newWealth
    print(f"Your wealth is now {self.wealth}.")

  def get_power(self):
    return self.power

  def get_wealth(self):
    return self.wealth

  def set_army(self, newArmy):
    self.army.append(newArmy)
    print(f"{newArmy} is now in your command.")

  def set_army_supreme(self, newArmy):
    self.army = newArmy
    print(f"Your armies have been replaced by {newArmy}.")

  def get_army(self):
    return self.army



###############################
#  Game class - Do not touch  #
###############################


def game():
  valid = True
  print("")
  print("        - MAFIA GAMES presents -        ")
  print("")

  print("        - IL CONSIGLIERE -         ")
  print("")

  while valid != False:
    print("")
    print("Welcome to Il Consigliere. To play, select one of the options below:")
    print("1. Guided Mode - for new players")
    print("2. Story Mode")
    print("3. Career Mode")
    print("4. The How to Everything [tutorial to the game - read before you play!]")
    print("5. Settings")
    print("6. Extras")
    print("0. Quit the game")

    uc = input("What do you want to play: ")
    try:
      uc = int(uc)
    except:
      print("Hey, that's not allowed. Even a mafia world has rules!")

    if uc == 1:
      while True:
        print("")
        print("Welcome to guided mode.")
        print("This is where you will learn how to play the game, and try to build the greatest mafia empire.")
        print("You will be guided all the way.")
        print("If you are not new to the game, you should play 'Story Mode' or 'Career Mode'. Here's your chance to go back:")
        back = input("Continue? (y/n) ")

        if back == 'n' or back == 'N':
          break

        elif back == 'y' or back == 'Y':
          name = input("Enter your name: ")
          mode = 'guided'

          print("")
          print("Choose which country to play in:")
          print("1. Italy")
          print("2. United States")

          pick = int(input("Your choice: "))

          country = "Italy" if pick == 1 else "US"
          print("")

          newWorld = World(name, mode, country)
          newWorld.map(pick)

          print("Now, let's get you in a family.")

          newWorld.set_family()
          family = newWorld.get_family()

          print("")
          print("Alright, are these correct?")

          newWorld.display()

          print("")
          check = input("Type anything or click enter to continue: ")
          print("")

          newStory = Story(name, country, family)

          print("")
          check = input("Type anything or click enter to continue: ")
          print("")

          newStory.c0()
          print("")

          newStory.c1()
          print("")

          newStory.c2()
          print("")

          newStory.c3()
          print()

          break
          print("")
          print("Game Over.")
          valid = False

        else:
          print("That's not valid!")

    elif uc == 2:
      print("In development!")
    
    
    elif uc == 3:
      print("In development!")
    
    
    elif uc == 4:
      print("In development!")
    
    
    elif uc == 5:
      print("In development!")
    
    
    elif uc == 6:
      print("In development!")

    elif uc == 0:
      quit = input("Are you sure? (y/n) ")
      if quit == "y" or quit == "Y":
        print("")
        print("Alright, you're out. Come back anytime.")
        valid = False
      elif quit == "n" or quit == "N":
        print("")
        print("Alright, taking you back.")
        print("")

    else:
      print("")
      print("Hey, that's not allowed. Even a mafia world has rules!")
      print("")


############
#  Others  #
############

# Nothing Yet


###########
#  Game  #
##########

game()
