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
  
  def map(self):
    map = '''
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

    print(map)

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
    print("====================")
    print("CHAPTER 1")
    print("====================")
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
    print("How will you reply? \n1. You are right, Sig Ricci. I loved Sig Bianchi like a father. \n2. Thank you, Sig Ricci. I will not heed these comments.")
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
    print("Here, try it out. Type 'characters', or 'familiarity' or 'loyalty' to print it out. When you're done, just type 'done'.")
    while True:
      test = input("What to print: ")
      if test == "characters":
        print(self.newStats.characters)
      elif test == "familiarity":
        print(self.newStats.familiarity)
      elif test == "loyalty":
        print(self.newStats.loyalty)
      elif test == "done":
        break
      else:
        "That's not right! Try again ..."
    print("")

    print("Well then, that leaves us with the other aspects of the game.")
    print(f"Your power is your influence in your region and family. \nThe higher your power, the more ability you have to make people do as you want.")
    print(f"Power can be increased by acquiring more wealth or armies. \nPower can range from 1(less powerful) to 100(most powerful).")
    print(f"Your power: {self.newStats.power}")
    print("")
    print(f"Your wealth is how much money you have. \nThe richer you are, the more you can bribe officials and buy powerful mercenary armies. \nMoney can range from 1(poor) to 100(very rich).")
    print(f"Your wealth: {self.newStats.wealth}")
    print("")
    print("Here, try it out. Type 'power', or 'wealth' to print it out. When you're done, just type 'done'.")
    while True:
      test = input("What to print: ")
      if test == "power":
        print(self.newStats.power)
      elif test == "wealth":
        print(self.newStats.wealth)
      elif test == "done":
        break
      else:
        "That's not right! Try again ..."
    print("")

    print("Armies can be used to enforce your will. Great mafia leaders often are rich and bankroll large mercenary armies.")
    print("There are many types of armies: mercenary(who fight for money), core(who fight for you out of loyalty) and family(who fight for your family).")
    print("You can acquire the first by paying up. The second requires time, and patience. Slowly, people loyal to you will build an army for you. The third, requires leadership of the house/family.")
    print("Each army is counted as 1 strength. The more units you have, the stronger you will be. \nNo surprise then, that armies increase your power significantly.")
    print(f"Your armies: {self.newStats.army}")
    print("")
    print("Here, try it out. Type 'army' to print it out. When you're done, just type 'done'.")
    while True:
      test = input("What to print: ")
      if test == "army":
        print(self.newStats.army)
      elif test == "done":
        break
      else:
        "That's not right! Try again ..."
    print("")

    print("RICCI: Well done! \nIn this chapter, you learnt the basics of the game. \nNext, we will learn about story objectives.")
    check = input("When you're ready to move on, type anything or click enter to continue: ")
    print("")
    print("")

  def c2(self):
    print("")
    print("====================")
    print("CHAPTER 2")
    print("====================")
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
    print("You can complete an objective by doing what it says: e.g. Typing 'Lombardy Lombardy Lombardy' into the box when it says type 'Lombardy' 3 times. ")
    print("")

    print("The following are objectives you can try to hit: ")
    print("1. [Assemble 5 armies, 20] - Type 'army' 5 times")
    print("2. [Improve relationships with RICCI, 30] - Type 'ricci' 6 times")
    print("3. [Conquer 2 neighbouring regions, 50] - Type 'Apuila' and 'Calabria'")

    while total != 100:
      print("")
      print(f'Your total: {total}')
      tr = input("Complete the objectives: ")

      if tr == 'army army army army army' or tr == 'armyarmyarmyarmyarmy':
        print("Assembled 5 armies.")
        total += 20
        print("")
      elif tr == 'ricci ricci ricci ricci ricci ricci' or tr == 'ricciricciricciricciricciricci':
        print("Improved relationship with Francesco Ricci.")
        total += 30
        print("")
      elif tr == 'Apuila Calabria' or tr == 'ApuilaCalabria' or tr == 'apuilacalabria' or tr == 'apuila calabria':
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
        print("Assembling your spy network...")
        time.sleep(5)
        print("Successfully assembled 'The Eyes'.")
        print()

        print("As you now control key information of your family and enemies, your power has increased.")
        self.newStats.set_power(self.newStats.get_power() + 1)
        print()

        c = input("When you're ready to move on, type anything or click enter to continue: ")
        flag = True

      else:
        print("Hmm, that doesn't seem right... Try again!")
        print()
    

    print("")



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
    print(f"Your power is now {self.wealth}.")

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
          newWorld.map()

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

          break
          print("")
          print("Game Over.")
          valid = False

        else:
          print("That's not valid!")

    elif uc == 2:
      pass
    elif uc == 3:
      pass
    elif uc == 4:
      pass
    elif uc == 5:
      pass
    elif uc == 6:
      pass

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