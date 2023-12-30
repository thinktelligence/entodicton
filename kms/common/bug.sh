#node properties -q "greg doesnt have wings does greg have wings" -d -g
# node properties -q "greg doesnt have wings" -d -g
# node properties -q -d -g 'the name of greg is greg greg is readonly the name of greg is fred'
# node ordering -q 'greg likes bananas and apples what does greg like' -d

# apply like/0 counter == 6
# node ordering -q 'greg likes bananas and grapes what does greg like' -d -g
# node ordering -q 'the name of greg is greg greg is readonly the name of greg is fred' -d -g
# node inspect wendy -q "what is your name"
# node inspect hierarchy -q 'cats are mammels what are the types of mammels'
# node foods -q 'strips are food' -d
# node foods -q 's2trips are food' -d
# node inspect kid -q 'what does wendy like'
# node inspect emotions -q 'greg feels angry what does greg feel' -d
# node emotions -q 'what is the emotion of greg' -d
# node inspect emotions -q 'what does greg feel' -d
# node inspect emotions -q 'what does greg feel' -d
# node inspect foods -q 'what are the type of food' -d
# node inspect kid -q 'what does wendy like' -d
# node inspect kid -q 'does wendy like bananas' -d
# node kid  -q "alice likes grapes\nhanna means alice\nwhat is hanna's name" -d
# node inspect kid -q "what is hanna's name" -d -g
# node inspect ordering -q "x like y x want y?" -d
# node inspect ordering -q "x like y x want y?" -d
# node ordering -q "if x likes y then x wants y" -d
# node inspect ordering -q "does x want y" -d
# node ordering -q "if x likes y then x wants y x likes y does x want y"
# node ordering -q "if x likes y then x wants y x likes y what does x want"
# node ordering -q "if x likes y then x wants y x likes y\nwhat does x want"
# node meta -q "if e or f then g" -d -g
# node inspect meta -q "if e or f then g gq" -d -g
# node inspect meta -q "if f then g gq" -d -g

# node ordering -q "if x likes y or x loves y then x wants y x likes y\ndoes x want y" -g
# node ordering -q "if x likes y or x loves y then x wants y" -g -d

# node meta -q "if e or f then g" -d -g
# node ordering -q "if x likes y or x loves y then x wants y x loves y\ndoes x want y" -g

# node ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g
# node ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\nwhat does x want" -g -d
# node ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\ndoes x want z" -g -d
# node ordering -q "if x likes y or x loves y then x wants y x likes z\ndoes x want z" -g -d

# node ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g

# node ordering -q "if x likes y or x loves y then x wants y x loves y x likes z\nwhat does x want" -g
# node ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g

# add text proerty to context 
# find out why cat is unknown
# node properties -q "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1" -g -d
# node inspect stgame -q 'kirk what is your name' -d -g
# stacked node properties -q "alice's sister is wendy wendy's cat is cleo\nwho is the cat of the sister of alice" -g -d
# stacked node properties -q "the age of greg is 23 what is greg's age" -g -d
# node inspect properties -q "alice's sister is wendy wendy's cat is cleo\nwho is alice's sister's cat" -g -d
# node properties -q "alice's sister is wendy" -g -d
# node inspect avatar -q "your name is greg what is your name" -d -g
# node avatar -tva -g
# node emotions -q 'greg feels angry what is the emotion of greg' -d -g
# node avatar -q 'your name is greg what is your name' -d -g
# node properties -q 'greg has eyes greg has eyes?' -g -d
# node properties -q 'the age of greg is 23 what is the age of greg' -g -d
# node inspect avatar -q 'your name is greg what is your name' -d -g
# node inspect properties -q 'what is the property of object' -d -g
# node properties -q 'greg has eyes?' -g -d
# node hierarchy -q 'cats and dogs are animals' -g -d
# node inspect ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g -d
# node ordering -q "greg likes bananas does greg like bananas" -g -d
# node ordering -tva -g
# node ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g -d
# node kirk -q 'what is your name' -d -g
# node crew -q 'you are kirk what is your name' -d -g
# node crew -q 'you are kirk what is your name' -d -g
# node inspect kid -q "what is hanna's name" -d -g
# node kid -q "greg23 means alice\nwhat is greg23's name" -d -g
# node kid -q "greg23 means alice" -d -g
# node inspect properties -q "the age of greg is 23 what are the properties of greg" -d -g
# node meta -q 'if f then g gq' -d -g
# node ordering -q "wendy loves bananas what does wendy like" -d -g
# node ordering -tva -g
# node inspect wendy -q 'what is your name' -d -g
# node kid -q "be brief what is wendy's name" -g -d
# node ordering -q 'be brief x1 likes x2 does x1 like x2' -g -d
# node inspect ordering -q 'be brief x1 likes x2 and x3 what does x1 like' -g -d
# node ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# node ordering -q 'if x likes y or x loves y then x wants y x loves y\nwhat does x want' -g -d
# node ordering -q 'wendy loves bananas what does wendy like' -g -d
# node inspect ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# node meta -tva -g
# node inspect meta -q 'if f then g gq' -d -g
# move the yesno in ordering 
# node inspect ordering -q "wendy loves bananas what does wendy like" -d -g -r
# node ordering -q "be brief x1 likes x2 what does x1 like" -d -g
# node properties -q 'what is the property of object' -d -g
# node properties -q 'the age of greg is 23\nwhat is the age of greg' -d -g
# node ordering -q "be brief x1 likes x2 does x1 like x2" -d -g
# PARK node ordering -q "if x likes y then x wants y x likes y\nwhat does x want" -d -g
# PARK node ordering -q "if x likes y then x wants y x likes y\ndoes x want y" -d -g
# node dialogues -q 'x is y?' -d -g
# node scorekeeper -tva -g
# node avatar -q 'greg has eyes greg has eyes?' -g -d
# node avatar -q 'greg has eyes?' -g -d -r
# node ordering -q 'wendy loves bananas what does wendy like' -g -d
# node ordering -q "be brief x1 likes x2 does x1 like x2" -d -g
# node people -g -q 'given name means first name' -d
#node inspect people -g -q 'the name of greg is 23' -d
# node people -g -q 'given name means first name the given name of greg is greg what is the given name of greg' -d
# node people -g -q 'the given name of greg is greg what is the given name of greg' -d
# node people -g -q 'the name of greg is greg23 what is the name of greg' -d
# node inspect people -g -q 'given name means first name the given name of greg is greg23 what is the given name of greg' -d
# TODO node people -g -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d
# STACK node inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -g -d
# node inspect hierarchy -q 'a human is a mammel debug23' -g -d
# node inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d -g
# node inspect foods -q 'what are the types of food' -d -g
# node currency -q '20 dollars in euros' -g
# node people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g
# node inspect avatar -q 'my name is greg what is my name' -d -g
# node inspect foods -q "what are the types of food" -d -g
# node ordering -q 'wendy loves bananas what does wendy like' -d -g
# PUSH node people -q 'the given name of greg is greg23 what is the given name of greg' -d -g
# PUSH node people -q 'the first name of greg is greg23 what is the given name of greg' -d -g
# node inspect people -q 'the given name of greg is greg23' -d -g
# node people -q 'the first name of greg is greg23' -d -g
# node emotion -tva -g
# node inspect people -q 'the first name of greg is greg23' -d -g
# node people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g
# node inspect properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -d -g
# node inspect hierarchy -g -q 'greg is a human a human is a mammel\nis greg a human'  -d
# node emotions -g -q 'sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1' -d
# node inspect pokemon -g -d -q 'what are the pokemon types'
# node crew -rt -g
# node pokemon -q 'who are the pokemen by type' -g
# node pokemon -q 'what is pikachu' -g -d
# node inspect hierarchy -q "mccoy's rank is doctor is mccoy a doctor" -g
# node inspect hierarchy -q "mccoy is a man\nmccoy is a doctor\nis mccoy a man" -g -d
# node pokemon -q 'what type is pikachu' -g -d
# node pokemon -q 'who is electric type' -g -d
# node inspect pokemon -q 'what is the type of pikachu' -g -d
# node inspect foods -q 'what are the types of food' -g -d
# node pokemon -q 'what type of pokemon is pikachu' -g
# node ordering -q "if a likes or loves b then a wants b" -d -g
# node ordering -q "if x likes y or x loves y then x wants y" -d -g
# node inspect ordering -q 'wants is xfx between wanter and wantee' -d -g
# node inspect people -q 'owns is xfx relation between owner and ownee' -g -d
# node people -g -q 'who owns cleo' -d
# node people -g -d -q 'wendy owns cleo what does wendy own'
# node people -g -d -q 'wendy owns cleo wendy owns mary what does wendy own'
# node people -g -d -q 'wendy owns cleo who is cleo owned by'
# cleo is owned by who
# [subject] owned [by] -> [owner]
# wendy owned cleo
# no arg 'by' converts to postfix -> arged by works like normal
# ((subject) (owned) [by]) -> owner
# cleo is owned by wendy means wendy owns cleo
# (cleo) [is] (owned by wendy) where (owned by wendy) == ownee
# version of is the unify cleo and ownee
# ([owned] ([by] ([wendy]))) -> [ownee] look at that
# node people -g -d -q 'cleo is owned by wendy'
# node people -g -d -q 'cleo is owned by who'
# node people -g -d -q who is cleo owned by'
# node people -g -d -q 'wendy owns cleo'
# node inspect crew -q 'who are the crew members' -g -d
# node dialogues -g -d -q 'what is it'
# node people -g -d -q 'who is owned by wendy'
# node people -g -d -q 'wendy owns cleo who is owned by wendy'
# node animals -q 'cats are animals are cats animals?' -g -d
# DONE no associations with -rt
# incremenatl update of assocaition while generating
# using the test sentences to generate associations as well
# dont save the developement ones
# node animals -rt -g
# node inspect hierarchy -g
# node inspect animals -rt -g
# node hierarchy -q "a human is a mammel greg is a human is greg a mammel" -g -d
# greg is part of the tests associations and should not be there
# node people -q "ownee is owned by owner means owner owns ownee" -g -d
# node people -q "ownee is owned by owner means owner owns ownee" -g -d
# node crew -tva -g -r 
# node people -g -d -q 'wendy owns cleo'
# node inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# node meta -q "undefined means defined" -g -d
# sort association and hierarchy
# node inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# node people -q "cleo is owned by wendy who owns cleo" -g -d
# node people -q "wendy owns cleo who owns cleo" -g -d
# node people -q "wendy owns cleo what does wendy own" -g -d
# node inspect people -q "cleo is owned by wendy who owns cleo" -g -d
# node people -q "who owns cleo" -g -d
# node properties -q 'greg has toes' -g -d
# node animals -q "do mammals have wings" -g -d
# node properties -q 'greg has toes greg has eyes?' -g -d
# node animals -q 'do dogs have skin' -g -d
# node properties -q 'greg doesnt have wings' -g -d
# node properties -q 'greg doesnt have wings does greg have wings' -g -d
# node people -tva -g 
# node people -q 'the cat owned by wendy' -d
# node people -q 'cleo is owned by wendy who owns cleo' -g -d
# TODO who is the person that owns cleo
# TODO setup focus for this one: node people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d
# node people -q 'wendy owns cleo who is the cat owned by wendy' -d
# maybe cat is a class or type
#node people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d
# node people -q 'ownee is owned by owner who is ownee owned by' -d

# two people named jeff talk about one have context resolve it
# node people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d
# node people -q 'wendy owns cleo\nwho is cleo owned by' -d
# node people -q 'cleo is owned by wendy who owns cleo' -d -g
# node hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d -g
# CONFLICT
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# node people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# TODO node people -q 'ownee is owned by owner who is ownee owned by' -d -g -r
# TODO focusable -> make an evaluate for getting focus
# TODO fix words for disarm the phasers
# who is ownee owned by
# the owner that owns ownee
# owner owns ownee is owner
# TODO put ids in the sematnics and allow a partial odering def that one goes before another -> make the learnable
# PARAPHRASE WRONG
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# node people -q 'who is ownee23 owned by' -d -g
# node people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# node people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# "ownee23 is owned by owner23" instead of "ownee23 owned by ownee23 is owner23"
# node people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -d -g 
# node people -q "cleo is owned by wendy who owns cleo" -d -g
# node inspect people -q "cleo is owned by wendy" -d -g
# node hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d 
# node people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d 
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g -r
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -g
# node properties -q 'greg has toes greg has eyes?' -g -d
# node properties -q 'greg has toes' -g -d
# node hierarchy -q 'cats and dogs are animals what are the types of animals' -g -d
# node inspect hierarchy -q 'what are the types of animals' -g -d
# node hierarchy -q 'cats and dogs are animals' -g -d
# node properties -q 'xfx between a1 and a2' -g -d
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -g -d
# node people -q 'ownee23 is owned by owner23' -g -d
# node people -q 'who is ownee23 owned by' -g -d
# node crew -q 'disarm the phasers' -g
# node inspect people -da '[["by",0],["is",0],["owned",0]]'
# node people -q "ownee23 is owned by owner23 who is ownee23 owned by" -g -d
# node people -q "owneevar is owned by ownervar" -g -d
# node people -q 'who is ownee23 owned by' -g -d
# node dialogues -q 'x is y?' -d -g
# node pokemon -q 'pikachu squirtle weedle and pidgeot are pokemon' -d -g
# node kid -q "wendy's cat is cleo" -d -g
# node kid -q "who is wendy's cat" -g -d
# node crew -q 'kirk is a crew member' -g -d -daa
# node pokemon -q 'what type is pikachu' -d -g
# node dialogues.js -q 'x is y?' -d -g
# node people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g 
# node crew -q 'who are the crew members' -g -d
# node crew -q 'the status of the photon torpedoes is armed\nwhat is the status of the photon torpedoes' -g -d
# node reports -q 'show the quantity descending and the price ascending' -g -d
# node reports -q 'call this report1\nshow report1' -g -d
# node inspect reports -q 'call this report1' -g -d
# node inspect reports -q 'call this report1\ndescribe report1' -g -d
# node inspect reports -q 'call this report1\nlist the models\ncall this report2\ndescribe the reports' -g -d
# node reports -g -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2'
# node reports -q 'worth means price times quantity the price is 10 the quantity is 5 what is the worth' -g -d
# node inspect dialogues -q 'x is 3 what is x' -d -g
# node dialogues -q 'be brief x is 3 what is x what is it' -d -g
#  node dialogues -q 'what is it' -d -g
# node scorekeeper -q 'whose turn is it' -d -g
# node scorekeeper -q 'greg got 10 points sara got 3 points greg got 2 points whose turn is it' -d -g
# node reports -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2' -g -d
# node reports -q 'call this report1\nlist the models\ncall this report2\nshow report2' -g -d
# node inspect reports -q 'call this report1\ndescribe the reports' -g -d
# node reports -q 'list the models\ncall this report1\nshow report1' -g -d
# node inspect reports -q 'show price and supplier' -g -d
# node emotions -q 'greg feels angry what is the emotion of greg' -g -d
# node inspect properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -g -d
# node reports -q 'call this report1\ndescribe report1' -g -d
# node reports -q 'list the models\ncall this report1\nshow report1' -g -d
# node reports -q 'call this report1\ndescribe the reports' -g -d
# node inspect reports -q 'show the quantity descending and the price ascending list the products' -g -d
# node reports -q 'list the products' -g -d
# node inspect reports -q 'call this report1 show report1' -g -d
# node scorekeeper -q 'start a new game\ngreg and jah 20 points' -g -d
# node reports -q 'call this report1\ndescribe report1' -g
# node reports -q 'answer with sentences list the models' -g
# node reports -q 'list the models\ncall this report1\nshow report1' -g
# node inspect reports -q 'list the models' -g
# node inspect reports -q 'show the quantity descending and the price ascending list the products' -g
# node inspect reports -q 'answer with sentences list the models' -g
# node reports -q 'call this report1\nshow report1' -g
# node reports -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2' -g -d
# node inspect reports -q 'call this report1\ndescribe the reports' -g -d
# node events -q 'after event1 action1 event1 event1' -g -d
# node reports -q 'after the report changes show the report\nmove column 2 to column 1' -g -d
# node reports -q 'move column 2 to column 1' -g -d
# node reports -q 'call this report1\ndescribe report1' -g -r
# node inspect reports -q 'after the report changes show the report\nanswer with sentences' -g -d -r
# node reports -q 'after the report changes show the report' -g -d -r
# node math -q 'x times y' -g -d
# node reports -q 'x is 20 show the report' -g -d
# node inspect dialogues -q 'x is 20 what is it' -g -d
# node inspect reports -q 'call this report1 show it' -g -d
# node math -q '4 times 5' -g -d 
# node inspect reports -q 'call this report1 show it' -g -d
# node inspect reports -q 'call it report1 show it' -g -d
# node inspect reports -q 'list the models\ncall this report1' -g -d 
# node reports -q 'call this report1 show it' -g -d
# node reports -q 'show the quantity descending and the price ascending' -g -d
# node math -q 'x is 3 y is 4 what is x' -g -d
# node inspect math -q 'what is 10 plus 2' -g -d
# node dialogues -q 'x is 3 what is x' -g -d
# node math -q 'x is 3 what is x' -g -d
# node inspect math -q 'x is 3 y is 4 what is x what is y' -g -d
# node inspect math -q 'x is 3 y is 4 what is x and y' -g -d
# node reports -q 'x is 20 show the report' -g -d
# TODO node reports -q 'call this report report1 show it' -g -d
# node math -q 'x is 3 y is 4 x times y' -g -d
# node time -q 'use 24 hour format' -g -d
# TODO node properties -q 'property of object' -g -d
# node inspect properties -q 'the age of greg is 23 the profession of greg is programmer what are the properties of greg' -g -d
# node properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -g -d
# node properties -q 'what is the property of object' -g -d
# node properties -q 'property of object' -g -d
# node properties -q 'the cat of the sister of alice' -g -d
# node avatar -q 'your name' -g -d
# node dialogues -q 'x is 3 what is x' -g -d
# node math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -g -d
# node hierarchy -q 'cats are animals dogs are animals' -d
# node hierarchy -q 'cats are animals dogs are animals what are the types of animals' -d
# TODO node reports -q 'delete the columns means remove the column
# TODO node math -q 'worth is price times quantity what does worth mean?' -g -d
# TODO node math -q 'worth is price times quantity what is the meaning of worth?' -g -d
# TODO node math -q '20 dollars times 10' -g -d
# TODO node scorekeeper -q 'what is the winning score' -g -d
# node math -q 'worth is price times quantity' -d
# TODO node reports -q "worth means price times quantity show the worth show the report" -d
# node inspect reports -q "worthdebug means price times quantity" -d -g
# node reports -q "show the worth list the models" -d
# node reports -q "worthdebug is price times quantity\\nshow the worthdebug list the models" -d
# TODO node math -q 'x is 3 y is 4 x*y'
# node inspect math -q 'price is 6 quantity is 4 worth means price times quantity what is the worth?' -d
# node reports -q "worthtest is price times quantity\\nshow the worthtest list the models" -d
# node reports -q "show the worthtest list the models" -d
# node inspect reports -q "worthtest is price times quantity" -d
# node math -q 'worth is price times quantity price is 6 quantity is 4 what is the worth ?' -d
# BAD - this could be fixed by doing left most complete and then redoing the remaining
#       the problem is worth is not defined since the def happens on the client side
# node math -q 'price is 6 worth is price times quantity quantity is 4\nwhat is the worth' -d
# node math -q 'price is 6 worth is price times quantity quantity is 4 what is the worth' -d -g
# GOOD
# node math -q 'price is 6 quantity is 4 worth is price times quantity what is the worth' -d
# node math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -d
# node reports -q 'answer with sentences list the models' -d
# node inspect people -q 'wendy owns cleo wendy owns mary what does wendy own' -d -g
# node people -q 'wendy owns cleo wendy owns mary what does wendy own' -d
# node people -q "cleo is a cat\nwendy owns cleo" -g -d
# node people -q "wendy owns cleo" -d -g
# TODO saying the same things twice or saying the opposite
# node people -q "cleo is a cat wendy owns cleo\nwho is the cat owned by wendy" -g -d
# node people -q 'wendy owns cleo' -d -g
# node people -q "who is the cat owned by wendy" -g -d
# node inspect people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -r
# // helpers/properties : 178
# people : 81
# call32
# hierarchy:125
# node people -q "given name means first name the first name of greg is greg23 what is the given name of greg" -d
# people : 81
# node people -q 'ownee23 is owned by owner23\nwho is ownee23 owned by' -d
# GOAL-0 node people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -g
# GOAL-1 node people -q "who is the cat owned by wendy" -g -d
# GOAL-2 node people -q "cleo is a cat\nwendy owns cleo\nwho is the cat owned by wendy" -g
# helpers/properties 367
# people 78
# node people -q 'the cat owned by wendy' -g -d 
# node people -q 'who is ownee23 owned by' -g -d
# node people -q 'ownee23 is owned by owner23' -d -g
# node people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# node scorekeeper -q 'start a new game\ngreg and jeff\nwho are the players' -d
# node pokemon -q 'what is the type of pikachu' -g -d
# node foods -q 'what are the types of food ' -d
# node foods -q 'chicken is food\nsushi is food\nwhat are the types of food' -d
# node foods -q 'chicken modifies strips' -d
# node foods -q 'chicken strips are food\nsushi is food\nwhat are the types of food' -d
# node foods -q 'sushi is food\nwhat are the types of food' -d
# node foods -q 'food' -d
# node pipboy -q 'testsetup1 weapon equip that' -d
# node pipboy -q 'the work outfit' -d -g
# node inspect pipboy -q 'testsetup1 weapon equip that' -g -d 
# node pipboy -q 'all the weapons' -g -d 
# node pipboy -q 'show all the weapons' -g -d
# node comparable -q 'lowest comparable' -g -d
# node pipboy -q 'highest damage pistol' -g -d
node pipboy -q 'equip the highest damage pistol' -g -d -s
# node pipboyTemplate -q "damage luck hp rads value ap charisma range accuracy are properties" -g -d
