#node properties -q "greg doesnt have wings does greg have wings" -d -g
# node properties -q "greg doesnt have wings" -d -g
# node properties -q -d -g 'the name of greg is greg greg is readonly the name of greg is fred'
# node ordering -q 'greg likes bananas and apples what does greg like' -d

# apply like/0 counter == 6
# node ordering -q 'greg likes bananas and grapes what does greg like' -d -g
# node ordering -q 'the name of greg is greg greg is readonly the name of greg is fred' -d -g -s
# node inspect kia -q "what is your name"
# node inspect hierarchy -q 'cats are mammels what are the types of mammels'
# node foods -q 'strips are food' -d
# node foods -q 's2trips are food' -d
# node inspect kid -q 'what does kia like'
# node inspect emotions -q 'greg feels angry what does greg feel' -d
# node emotions -q 'what is the emotion of greg' -d
# node inspect emotions -q 'what does greg feel' -d
# node inspect emotions -q 'what does greg feel' -d
# node inspect foods -q 'what are the type of food' -d
# node inspect kid -q 'what does kia like' -d
# node inspect kid -q 'does kia like bananas' -d
# node kid  -q "hana likes grapes\nhanna means hana\nwhat is hanna's name" -d
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

# node ordering -q "if x likes y or x loves y then x wants y x likes y\ndoes x want y" -g -s
# node ordering -q "if x likes y or x loves y then x wants y" -g -d -s

# node meta -q "if e or f then g" -d -g
# node ordering -q "if x likes y or x loves y then x wants y x loves y\ndoes x want y" -g -s

# node ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g -s
# node ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\nwhat does x want" -g -d
# node ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\ndoes x want z" -g -d
# node ordering -q "if x likes y or x loves y then x wants y x likes z\ndoes x want z" -g -d

# node ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g

# node ordering -q "if x likes y or x loves y then x wants y x loves y x likes z\nwhat does x want" -g
# node ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g -s

# add text proerty to context 
# find out why cat is unknown
# node properties -q "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1" -g -d
# node inspect stgame -q 'kirk what is your name' -d -g
# stacked node properties -q "hana's sister is kia kia's cat is cleo\nwho is the cat of the sister of hana" -g -d
# stacked node properties -q "the age of greg is 23 what is greg's age" -g -d
# node inspect properties -q "hana's sister is kia kia's cat is cleo\nwho is hana's sister's cat" -g -d
# node properties -q "hana's sister is kia" -g -d
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
# node kid -q "greg23 means hana\nwhat is greg23's name" -d -g
# node kid -q "greg23 means hana" -d -g
# node inspect properties -q "the age of greg is 23 what are the properties of greg" -d -g
# node meta -q 'if f then g gq' -d -g
# node ordering -q "kia loves bananas what does kia like" -d -g
# node ordering -tva -g
# node inspect kia -q 'what is your name' -d -g
# node kid -q "be brief what is kia's name" -g -d -s
# node ordering -q 'be brief x1 likes x2 does x1 like x2' -g -d -s
# node inspect ordering -q 'be brief x1 likes x2 and x3 what does x1 like' -g -d
# node ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# node ordering -q 'if x likes y or x loves y then x wants y x loves y\nwhat does x want' -g -d
# node ordering -q 'kia loves bananas what does kia like' -g -d
# node inspect ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# node meta -tva -g
# node inspect meta -q 'if f then g gq' -d -g
# move the yesno in ordering 
# node inspect ordering -q "kia loves bananas what does kia like" -d -g -r
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
# node ordering -q 'kia loves bananas what does kia like' -g -d
# node ordering -q "be brief x1 likes x2 does x1 like x2" -d -g
# node people -g -q 'given name means first name' -d
#node inspect people -g -q 'the name of greg is 23' -d
# node people -g -q 'given name means first name the given name of greg is greg what is the given name of greg' -d
# node people -g -q 'the given name of greg is greg what is the given name of greg' -d
# node people -g -q 'the name of greg is greg23 what is the name of greg' -d
# node inspect people -g -q 'given name means first name the given name of greg is greg23 what is the given name of greg' -d
# TODO node people -g -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -s
# STACK node inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -g -d
# node inspect hierarchy -q 'a human is a mammel debug23' -g -d
# node inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d -g
# node inspect foods -q 'what are the types of food' -d -g
# node currency -q '20 dollars in euros' -g
# node people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g -s
# node inspect avatar -q 'my name is greg what is my name' -d -g
# node inspect foods -q "what are the types of food" -d -g
# node ordering -q 'kia loves bananas what does kia like' -d -g
# PUSH node people -q 'the given name of greg is greg23 what is the given name of greg' -d -g
# PUSH node people -q 'the first name of greg is greg23 what is the given name of greg' -d -g
# node inspect people -q 'the given name of greg is greg23' -d -g -s
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
# node pokemon -q 'what type is pikachu' -g -d -s
# node pokemon -q 'who is electric type' -g -d -s
# node inspect pokemon -q 'what is the type of pikachu' -g -d -s
# node inspect foods -q 'what are the types of food' -g -d
# node pokemon -q 'what type of pokemon is pikachu' -g
# node ordering -q "if a likes or loves b then a wants b" -d -g
# node ordering -q "if x likes y or x loves y then x wants y" -d -g
# node inspect ordering -q 'wants is xfx between wanter and wantee' -d -g
# node inspect people -q 'owns is xfx relation between owner and ownee' -g -d
# node people -g -q 'who owns cleo' -d
# node people -g -d -q 'kia owns cleo what does kia own' -s
# node people -g -d -q 'kia owns cleo kia owns mary what does kia own' -s
# node people -g -d -q 'kia owns cleo who is cleo owned by' -s
# cleo is owned by who
# [subject] owned [by] -> [owner]
# kia owned cleo
# no arg 'by' converts to postfix -> arged by works like normal
# ((subject) (owned) [by]) -> owner
# cleo is owned by kia means kia owns cleo
# (cleo) [is] (owned by kia) where (owned by kia) == ownee
# version of is the unify cleo and ownee
# ([owned] ([by] ([kia]))) -> [ownee] look at that
# node people -g -d -q 'cleo is owned by kia' -s
# node people -g -d -q 'cleo is owned by who' -s
# node people -g -d -q who is cleo owned by' -s
# node people -g -d -q 'kia owns cleo'
# node inspect crew -q 'who are the crew members' -g -d
# node dialogues -g -d -q 'what is it'
# node people -g -d -q 'who is owned by kia'
# node people -g -d -q 'kia owns cleo who is owned by kia'
# node animals -q 'cats are animals are cats animals?' -g -d
# DONE no associations with -rt
# incremenatl update of assocaition while generating
# using the test sentences to generate associations as well
# dont save the developement ones
# node animals -rt -g
# node inspect hierarchy -g -s
# node inspect animals -rt -g
# node hierarchy -q "a human is a mammel greg is a human is greg a mammel" -g -d
# greg is part of the tests associations and should not be there
# node people -q "ownee is owned by owner means owner owns ownee" -g -d -s
# node people -q "ownee is owned by owner means owner owns ownee" -g -d -s
# node crew -tva -g -r 
# node people -g -d -q 'kia owns cleo'
# node inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# node meta -q "undefined means defined" -g -d -s
# sort association and hierarchy
# node inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# node people -q "cleo is owned by kia who owns cleo" -g -d -s
# node people -q "kia owns cleo who owns cleo" -g -d
# node people -q "kia owns cleo what does kia own" -g -d
# node inspect people -q "cleo is owned by kia who owns cleo" -g -d
# TODO who is the person that owns cleo
# node people -q "who owns cleo" -g -d
# node properties -q 'greg has toes' -g -d
# node animals -q "do mammals have wings" -g -d
# node properties -q 'greg has toes greg has eyes?' -g -d
# node animals -q 'do dogs have skin' -g -d
# node properties -q 'greg doesnt have wings' -g -d
# node properties -q 'greg doesnt have wings does greg have wings' -g -d
# node people -tva -g 
# node people -q 'the cat owned by kia' -d
# TODO node people -q 'ownee is owned by owner who is ownee owned by' -g -d
# node people -q 'cleo is owned by kia who owns cleo' -g -d
node inspect people -q 'cleo is a cat kia owns cleo who is the cat owned by kia' -d
