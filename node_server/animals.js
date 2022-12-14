const animalList = [
	"wild bird",
	"horse",
	"dog",
	"cow",
	"other fish",
	"mouse",
	"duck",
	"cat",
	"elephant",
	"pigeon",
	"zebra",
	"giraffe",
	"kettle",
	"chicken",
	"deer",
	"goose",
	"penguin",
	"swan",
	"goldfish",
	"shrimp",
	"bear",
	"pig",
	"camel",
	"crab",
	"antelope",
	"parrot",
	"seal",
	"butterfly",
	"donkey",
	"lion",
	"dolphin",
	"jellyfish",
	"monkey",
	"rabbit",
	"yak",
	"lobster",
	"bird",
	"cat",
	"cow",
	"dog",
	"horse",
	"sheep",
	"bird",
	"cat",
	"dog",
	"horse",
	"sheep",
	"cow",
	"elephant",
	"bear",
	"zebra",
	"giraffe",
	"mouse",
	"bird",
	"cat",
	"dog",
	"horse",
	"sheep",
	"cow",
	"elephant",
	"bear",
	"zebra",
	"giraffe",
	"mouse",
	"goldfish",
	"great white shark",
	"tiger shark",
	"hammerhead shark",
	"electric ray",
	"stingray",
	"cock",
	"hen",
	"ostrich",
	"brambling",
	"goldfinch",
	"house finch",
	"junco",
	"indigo bunting",
	"american robin",
	"bulbul",
	"jay",
	"magpie",
	"chickadee",
	"american dipper",
	"bald eagle",
	"vulture",
	"great grey owl",
	"fire salamander",
	"smooth newt",
	"newt",
	"spotted salamander",
	"axolotl",
	"american bullfrog",
	"tree frog",
	"tailed frog",
	"loggerhead sea turtle",
	"leatherback sea turtle",
	"mud turtle",
	"terrapin",
	"box turtle",
	"banded gecko",
	"green iguana",
	"carolina anole",
	"desert grassland whiptail lizard",
	"agama",
	"frilled-necked lizard",
	"alligator lizard",
	"gila monster",
	"european green lizard",
	"chameleon",
	"komodo dragon",
	"nile crocodile",
	"american alligator",
	"triceratops",
	"worm snake",
	"ring-necked snake",
	"eastern hog-nosed snake",
	"smooth green snake",
	"kingsnake",
	"garter snake",
	"water snake",
	"vine snake",
	"night snake",
	"boa constrictor",
	"african rock python",
	"indian cobra",
	"green mamba",
	"sea snake",
	"saharan horned viper",
	"eastern diamondback rattlesnake",
	"sidewinder",
	"trilobite",
	"harvestman",
	"scorpion",
	"yellow garden spider",
	"barn spider",
	"european garden spider",
	"southern black widow",
	"tarantula",
	"wolf spider",
	"tick",
	"centipede",
	"black grouse",
	"ptarmigan",
	"ruffed grouse",
	"prairie grouse",
	"peacock",
	"quail",
	"partridge",
	"grey parrot",
	"macaw",
	"sulphur-crested cockatoo",
	"lorikeet",
	"coucal",
	"bee eater",
	"hornbill",
	"hummingbird",
	"jacamar",
	"toucan",
	"duck",
	"red-breasted merganser",
	"goose",
	"black swan",
	"tusker",
	"echidna",
	"platypus",
	"wallaby",
	"koala",
	"wombat",
	"jellyfish",
	"sea anemone",
	"brain coral",
	"flatworm",
	"nematode",
	"conch",
	"snail",
	"slug",
	"sea slug",
	"chiton",
	"chambered nautilus",
	"dungeness crab",
	"rock crab",
	"fiddler crab",
	"red king crab",
	"american lobster",
	"spiny lobster",
	"crayfish",
	"hermit crab",
	"isopod",
	"white stork",
	"black stork",
	"spoonbill",
	"flamingo",
	"little blue heron",
	"great egret",
	"bittern",
	"crane (bird)",
	"limpkin",
	"common gallinule",
	"american coot",
	"bustard",
	"ruddy turnstone",
	"dunlin",
	"common redshank",
	"dowitcher",
	"oystercatcher",
	"pelican",
	"king penguin",
	"albatross",
	"grey whale",
	"killer whale",
	"dugong",
	"sea lion",
	"chihuahua",
	"japanese chin",
	"maltese",
	"pekingese",
	"shih tzu",
	"king charles spaniel",
	"papillon",
	"toy terrier",
	"rhodesian ridgeback",
	"afghan hound",
	"basset hound",
	"beagle",
	"bloodhound",
	"bluetick coonhound",
	"black and tan coonhound",
	"treeing walker coonhound",
	"english foxhound",
	"redbone coonhound",
	"borzoi",
	"irish wolfhound",
	"italian greyhound",
	"whippet",
	"ibizan hound",
	"norwegian elkhound",
	"otterhound",
	"saluki",
	"scottish deerhound",
	"weimaraner",
	"staffordshire bull terrier",
	"american staffordshire terrier",
	"bedlington terrier",
	"border terrier",
	"kerry blue terrier",
	"irish terrier",
	"norfolk terrier",
	"norwich terrier",
	"yorkshire terrier",
	"wire fox terrier",
	"lakeland terrier",
	"sealyham terrier",
	"airedale terrier",
	"cairn terrier",
	"australian terrier",
	"dandie dinmont terrier",
	"boston terrier",
	"miniature schnauzer",
	"giant schnauzer",
	"standard schnauzer",
	"scottish terrier",
	"tibetan terrier",
	"australian silky terrier",
	"soft-coated wheaten terrier",
	"west highland white terrier",
	"lhasa apso",
	"flat-coated retriever",
	"curly-coated retriever",
	"golden retriever",
	"labrador retriever",
	"chesapeake bay retriever",
	"german shorthaired pointer",
	"vizsla",
	"english setter",
	"irish setter",
	"gordon setter",
	"brittany",
	"clumber spaniel",
	"english springer spaniel",
	"welsh springer spaniel",
	"cocker spaniels",
	"sussex spaniel",
	"irish water spaniel",
	"kuvasz",
	"schipperke",
	"groenendael",
	"malinois",
	"briard",
	"australian kelpie",
	"komondor",
	"old english sheepdog",
	"shetland sheepdog",
	"collie",
	"border collie",
	"bouvier des flandres",
	"rottweiler",
	"german shepherd dog",
	"dobermann",
	"miniature pinscher",
	"greater swiss mountain dog",
	"bernese mountain dog",
	"appenzeller sennenhund",
	"entlebucher sennenhund",
	"boxer",
	"bullmastiff",
	"tibetan mastiff",
	"french bulldog",
	"great dane",
	"st. bernard",
	"husky",
	"alaskan malamute",
	"siberian husky",
	"dalmatian",
	"affenpinscher",
	"basenji",
	"pug",
	"leonberger",
	"newfoundland",
	"pyrenean mountain dog",
	"samoyed",
	"pomeranian",
	"chow chow",
	"keeshond",
	"griffon bruxellois",
	"pembroke welsh corgi",
	"cardigan welsh corgi",
	"toy poodle",
	"miniature poodle",
	"standard poodle",
	"mexican hairless dog",
	"grey wolf",
	"alaskan tundra wolf",
	"red wolf",
	"coyote",
	"dingo",
	"dhole",
	"african wild dog",
	"hyena",
	"red fox",
	"kit fox",
	"arctic fox",
	"grey fox",
	"tabby cat",
	"tiger cat",
	"persian cat",
	"siamese cat",
	"egyptian mau",
	"cougar",
	"lynx",
	"leopard",
	"snow leopard",
	"jaguar",
	"lion",
	"tiger",
	"cheetah",
	"brown bear",
	"american black bear",
	"polar bear",
	"sloth bear",
	"mongoose",
	"meerkat",
	"tiger beetle",
	"ladybug",
	"ground beetle",
	"longhorn beetle",
	"leaf beetle",
	"dung beetle",
	"rhinoceros beetle",
	"weevil",
	"fly",
	"bee",
	"ant",
	"grasshopper",
	"cricket",
	"stick insect",
	"cockroach",
	"mantis",
	"cicada",
	"leafhopper",
	"lacewing",
	"dragonfly",
	"damselfly",
	"red admiral",
	"ringlet",
	"monarch butterfly",
	"small white",
	"sulphur butterfly",
	"gossamer-winged butterfly",
	"starfish",
	"sea urchin",
	"sea cucumber",
	"cottontail rabbit",
	"hare",
	"angora rabbit",
	"hamster",
	"porcupine",
	"fox squirrel",
	"marmot",
	"beaver",
	"guinea pig",
	"common sorrel",
	"zebra",
	"pig",
	"wild boar",
	"warthog",
	"hippopotamus",
	"ox",
	"water buffalo",
	"bison",
	"ram",
	"bighorn sheep",
	"alpine ibex",
	"hartebeest",
	"impala",
	"gazelle",
	"dromedary",
	"llama",
	"weasel",
	"mink",
	"european polecat",
	"black-footed ferret",
	"otter",
	"skunk",
	"badger",
	"armadillo",
	"three-toed sloth",
	"orangutan",
	"gorilla",
	"chimpanzee",
	"gibbon",
	"siamang",
	"guenon",
	"patas monkey",
	"baboon",
	"macaque",
	"langur",
	"black-and-white colobus",
	"proboscis monkey",
	"marmoset",
	"white-headed capuchin",
	"howler monkey",
	"titi",
	"geoffroy's spider monkey",
	"common squirrel monkey",
	"ring-tailed lemur",
	"indri",
	"asian elephant",
	"african bush elephant",
	"red panda",
	"giant panda",
	"snoek",
	"eel",
	"coho salmon",
	"rock beauty",
	"clownfish",
	"sturgeon",
	"garfish",
	"lionfish",
	"pufferfish"
]

module.exports = { animalList };