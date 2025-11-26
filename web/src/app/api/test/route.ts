import { NextResponse, NextRequest } from "next/server";

// // api/v1/videos/[url]/route.ts
// export async function GET(request: NextRequest) {
//     const youtubeUrl = encodeURIComponent(
//         "https://www.youtube.com/watch?v=khH2dCs0cM4"
//     );

//     const response = await fetch(
//         `${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Cookie: request.headers.get("cookie") || "",
//             },
//             body: JSON.stringify({
//                 platform: "YouTube",
//                 title: "Test Video Title",
//                 channel_name: "Test Channel",
//                 duration: 300,
//                 category: "Test Category",
//                 url: "https://www.youtube.com/watch?v=khH2dCs0cM4",
//                 description: "Test Video Description",
//                 video_id: "khH2dCs0cM4",
//             }),
//         }
//     );

//     const data = await response.json();
//     return NextResponse.json({
//         status: response.status,
//         data,
//     });
// }

// // api/v1/videos/[url]/educational/route.ts
// export async function GET(request: NextRequest) {
//     // Use a different video that should have captions - TED talk or educational content
//     // https://www.youtube.com/watch?v=UF8uR6Z6KLc
//     const youtubeUrl = encodeURIComponent("https://www.youtube.com/watch?v=eHwe7_9zvl8");

//     const queryParams = new URLSearchParams();
//     queryParams.append('videoId', "eHwe7_9zvl8");
//     queryParams.append('authToken', "7wplB57D5v4lM2tQTDcrOLFuKTU1rdXkQUulEDplm3RTcTOh5hsmclpqBG3UvRYE");
//     queryParams.append('processType', "automatic");

//     const response = await fetch(`${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}/educational?${queryParams.toString()}`, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//             "Cookie": request.headers.get("cookie") || ""
//         },
//     });

//     const data = await response.json();
//     return NextResponse.json({
//         status: response.status,
//         data
//     });
// }

// // api/v1/videos/[url]/summarize/route.ts
// export async function GET(request: NextRequest) {
//     const youtubeUrl = encodeURIComponent(
//         "https://www.youtube.com/watch?v=khH2dCs0cM4"
//     );

//     const title = "Applications of Deep Neural Networks PyTorch Course Overview (1.1, Summer 2025)";
//     const description = "Applications of deep neural networks is a course offered in a hybrid format by Washington University in St. Louis.  This course introduces PyTorch deep neural networks and highlights applications that neural networks are particularly adept at handling compared to previous machine learning models.\n\nCode for This Video: \nhttps://github.com/jeffheaton/app_deep_learning/blob/main/t81_558_class_01_1_overview.ipynb\n\n~~~~~~~~~~~~~~~ COURSE MATERIAL ~~~~~~~~~~~~~~~ \n📖 Textbook - coming soon\n😸🐙 GitHub - https://github.com/jeffheaton/app_deep_learning\n▶️ Play List - https://www.youtube.com/playlist?list=PLjy4p-07OYzuy_lHcRW8lPTLPTTOmUpmi\n🏫 WUSTL Course Site - https://sites.wustl.edu/jeffheaton/t81-558/\n\n\n~~~~~~~~~~~~~~~ CONNECT ~~~~~~~~~~~~~~~ \n🖥️ Website: https://www.heatonresearch.com/ \n🐦 Twitter - https://twitter.com/jeffheaton \n😸🐙 GitHub - https://github.com/jeffheaton\n📸 Instagram - https://www.instagram.com/jeffheatondotcom/\n🦾 Discord: https://discord.gg/3bjthYv \n▶️ Subscribe: https://www.youtube.com/c/heatonresearch?sub_confirmation=1\n\n\n~~~~~~~~~~~~~~ SUPPORT ME  🙏~~~~~~~~~~~~~~ \n🅿 Patreon - https://www.patreon.com/jeffheaton\n🙏 Other Ways to Support (some free) - https://www.heatonresearch.com/support.html\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n#pytorch";
//     const transcript = "welcome to applications of deep neural networks at Washington University this is the summer 2025 session of this class if you are from the university you'll find everything on both Calura and Canvas if you are tuning in to this from the internet I do put everything on GitHub and YouTube so you'll find the links to all of that in the description of this video so if we go here to my GitHub repository you'll see that I have a number of repos here we're dealing with the application of deep learning i also teach a generative AI class so this is how I like to think of the AI world you've got AI which is everything this is basically just making machines act like humans essentially machine learning is when you learn from data and there's a lot of applications of that deep learning is specifically neural networks and then generative AI exists pretty well completely within the realm of deep learning there's there's some aspects of it certainly that are not and then you've also got predictive AI this is what I think of your classic data science where you're trying to predict things computer vision I put into this as well you're giving it input and it's predicting some sort of a an output versus generative AI where it's things like text to text where you give it text it gives you text back or image to image where you give it an image it applies some filtering to it maybe it takes black and white to color something like that or text to image you describe something that you wanted to create and it creates it for you so these two really are the the world of the of of my two classes we are dealing with predictive AI you can find links to the other course as well if you're interested in it and it will be offered in the fall so all of this is on GitHub and on YouTube so let's pop into applications of deep learning there'll be a link to this you'll see that we are basically in the readme file here and it gives you all the important links and everything i do need to update that to the summer but all the dates in here are officially the summer dates the summer class is ran quite a bit faster than your typical semester class so you'll see that these modules in the fall it would be one module per week but here you can see we have module one the first week and then we have uh these two modules together and you'll have a lot of times where you have two modules together so we're going at double speed quite a few of the weeks now the class the assignments for this class you will have 10 programming assignments and they're all in this assignments directory if you're checking this out from the internet you can certainly look at these you won't be able to submit them for grade i'll show you students of war how to submit these when we meet for class the first time in summer this is a completely online class so we will meet we'll meet via Zoom there's also a icebreaker at the beginning this is just for you to post in Canvas in the Worshoe system and get to know each other because we're going to get into something that is a Kaggle competition the Kaggle competition is basically a um it's it's Kaggle and I'm going to create a data set for all of you to compete against each other and we'll see according to the leaderboard where everybody lands on this you will be able to do this in teams just like in real Kaggle competitions and then there's a final project i'm still figuring out exactly i'm going to upgrade this this used to be a paper but I mean come on in the world of chat GPT does anybody does any professor really assign papers because let's be real if you if I assign you a paper you're going to have chat GPT write it and let's be real I'm going to have ChatGpt grade it so what is the point in that you'll have my chatbot talk to your chatbot this will probably be something on Vibe coding i need to kind of put that together uh still but that'll be ready by the time that we get to it so these are all of the assignments this is how you will be assessed in the course so let's jump right into the first module so we're looking at all of these in GitHub github's great and all but you're going to probably want to edit them make changes and it just looks better if you open it up actually in Collab and now you're actually running Python code in here so I mean you could say print hello world whatever you want to say comma 2 + 2 and you can run this and it will actually spin up a virtual machine and run it for you they don't give you really really super advanced machines for free you can see that I do have a subscription version but you should be just fine with collab free you can also run all of this code on your local computer i'm gonna recommend that unless you like really setting up a lot of especially if you're going to try to get the GPU to work i would suggest running it through Collab there's virtually nothing in this course that is going to require you to have a GPU though having a GPU will certainly cause things to run faster so you can see there the big the big four of deep learning who really kind of brought AI back out of one of its winters and into the forefront so they launched deep learning and then before we even had another sort of AI winter we had generative AI so I mean this these are amazing times truly for artificial intelligence yan Lern is French Canadian who did a lot of the computer vision we'll definitely be dealing with some of his contributions convolution neural networks jeffrey Henton obviously the created back propagation godfather of neural networks yosua Benjio another I mean a lot of these are Canadian and created uh many of the the algorithms particularly some of the generative adversarial neural networks that in many ways gave rise to some of what we see with generative AI andrew Ning who I have taken so many of his courses amazing amazing instructor the first three of these individuals did win the touring prize unfortunately you can't have four people win the touring prize the touring prize is sort of like the Nobel Prize of computer science because computer scientists can't really win the Nobel Prize aha but then then came Jeffrey Henton who who who showed that computer scientists um people outside of physics can win the physics uh Nobel Prize so Jeffrey Hinton has won the touring and the Nobel Prize i don't know that anybody has won both of those be a great question for chat GPT so what we're doing in this course traditional software development is where you put input data into the computer and you wrote program code and it produced an output for you now with machine learning program you put input data into the computer you give it the output and it trains on it and it gives you a model which is basically your program code so you're teaching an artificial neural network to be able to produce output according to that input data and the thing is when you have new input data that you've never seen the output for it's going to make a prediction so you can program it on say the stock market up to a certain date and you're giving it the input you're giving it the output how well the the the stocks actually performed and then it gives you a model that in theory will will predict future movements in the stock market now I'm still working for a living so obviously I haven't figured that one out yet these are the types of applications of machine learning particularly for neural networks you have computer vision this is really the bread and butter of PyTorch and the neural networks that we're dealing with tabular data okay maybe that's that's data that fits into Excel you've got nice rows and columns and all that kind of stuff uh you'd be better off with a gradient boosted machine than a neural network natural language processing this is another one that neural networks have just dominated i don't think especially with generative AI I don't think you hardly use traditional natural language processing anymore you you use it when you want highly deterministic results perhaps reinforcement learning this is used a lot by self-driving cars some of the amazing things that we've learned about chess and beating go players has been there time series that's the kind of the stock market prediction time series interestingly is is connected very closely with natural language processing because natural language processing is really kind of like time series you've got letters occurring over time and generative AI oh my gosh just literally four years ago when I would teach this class I would be like \"Yeah and we've got this weird thing generative AI you can create human faces with it.\" And and oh my gosh it had I would have never guessed that I would create an entire class on generative AI it has it has taken the world by storm i mean those of you that have been doing this since I don't know since at least five years did did you see generative AI coming i mean it came like a Mac truck so we have regression classification regression is where the neural network is taking in numbers and predicting another number like some risk score or like you might give it cars and it tries to predict the miles per gallon for a car how efficient the car is another data set that you will see is the iris data set where you you you give it some measures of a particular type of flower and then it's going to attempt to predict it's going to predict the class classification it's going to classify it as one of three iris species those are very simple examples but that's where we'll start at least a little bit why deep learning there are a lot of other machine learning constructs support vector machines random force and gradient boosting are among the top ones that I've dealt with that is really it's if you're doing tabular data yeah use one of these three but if you're using highly unstructured data and most of the interesting data in the world is unstructured you'll probably want to use deep learning why Python python has taken the world by storm propelled a lot by AI it's it's a easily approachable language i do expect that you've done some programming before this class particularly Python there there have been people who have picked this up as they go you'll hear me refer to vibe coding vibe coding is where you have chat GPT help you a lot on this and that is that is perfectly acceptable to use generative AI in this class is absolutely not cheating you can use it for anything that you want to in this class i'm not going to tell you that something is cheating when as soon as you work in industry they're going to tell you use use generative AI because you need to know this stuff to survive in the in the career field uh believe me this is this is coming fast you will have a few tokens and keys in this class so I'm going to send you a homework submission API key you should just wore students obviously you should get that emailed to me by the first class session you'll get a you'll get an announcement in Canvas telling you all about that you'll need to create a hugging face key and an open and I will give you an open AI key it's just a sample one that you'll use for the one session that we deal with generative AI in this class and then if you just want to run uh this program just to demonstrate this shows you the current version if you have a GPU by the way if you want to use Apple Metal so M1 M2 kind of stuff everything in this course should be compatible with Apple Metal and then we get to the first assignment the first assignment is really pretty easy all you have to do is put your key into it and run it this is just to prove that you can actually execute Python code and that you can put the key in and run it module two you'll get to do some actual coding so this is everything uh welcome to this semester i look forward to to uh working with all of you and seeing you on the first Zoom call and thank you for watching this video and if you want to subscribe to the channel you'll get any updates that I do i do this class the other class as well as a lot of projects that I find interesting using Gen AI using Gen AI to generate the code uh as well as the things that humans still need to do for programming this stuff so thank you for watching if this is useful you know smash that like button";

//     const response = await fetch(
//         `${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}/summarize`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Cookie: request.headers.get("cookie") || "",
//             },
//             body: JSON.stringify({
//                 title: title,
//                 description: description,
//                 transcript: transcript
//             })
//         }
//     );

//     try {
//         // Check if response is ok before parsing
//         if (!response.ok) {
//             console.error(`Error response: ${response.status} ${response.statusText}`);
//             // Read the response text for debugging
//             const errorText = await response.text();
//             console.error(`Response body: ${errorText}`);
//             return NextResponse.json({
//                 status: response.status,
//                 error: response.statusText,
//                 details: errorText || "No response body"
//             }, { status: 500 });
//         }

//         // Only try to parse JSON for successful responses
//         const data = await response.json();
//         return NextResponse.json({
//             status: response.status,
//             data,
//         });
//     } catch (error) {
//         console.error("Error parsing response:", error);
//         return NextResponse.json({
//             status: 500,
//             error: "Failed to parse response",
//             details: error instanceof Error ? error.message : String(error)
//         }, { status: 500 });
//     }
// }

// // api/v1/videos/[url]/questions/route.ts
// export async function GET(request: NextRequest) {
//     const youtubeUrl = encodeURIComponent(
//         "https://www.youtube.com/watch?v=khH2dCs0cM4"
//     );

//     const video_id = 1;
//     const title = "Applications of Deep Neural Networks PyTorch Course Overview (1.1, Summer 2025)";
//     const description = "Applications of deep neural networks is a course offered in a hybrid format by Washington University in St. Louis.  This course introduces PyTorch deep neural networks and highlights applications that neural networks are particularly adept at handling compared to previous machine learning models.\n\nCode for This Video: \nhttps://github.com/jeffheaton/app_deep_learning/blob/main/t81_558_class_01_1_overview.ipynb\n\n~~~~~~~~~~~~~~~ COURSE MATERIAL ~~~~~~~~~~~~~~~ \n📖 Textbook - coming soon\n😸🐙 GitHub - https://github.com/jeffheaton/app_deep_learning\n▶️ Play List - https://www.youtube.com/playlist?list=PLjy4p-07OYzuy_lHcRW8lPTLPTTOmUpmi\n🏫 WUSTL Course Site - https://sites.wustl.edu/jeffheaton/t81-558/\n\n\n~~~~~~~~~~~~~~~ CONNECT ~~~~~~~~~~~~~~~ \n🖥️ Website: https://www.heatonresearch.com/ \n🐦 Twitter - https://twitter.com/jeffheaton \n😸🐙 GitHub - https://github.com/jeffheaton\n📸 Instagram - https://www.instagram.com/jeffheatondotcom/\n🦾 Discord: https://discord.gg/3bjthYv \n▶️ Subscribe: https://www.youtube.com/c/heatonresearch?sub_confirmation=1\n\n\n~~~~~~~~~~~~~~ SUPPORT ME  🙏~~~~~~~~~~~~~~ \n🅿 Patreon - https://www.patreon.com/jeffheaton\n🙏 Other Ways to Support (some free) - https://www.heatonresearch.com/support.html\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n#pytorch";
//     const transcript = "welcome to applications of deep neural networks at Washington University this is the summer 2025 session of this class if you are from the university you'll find everything on both Calura and Canvas if you are tuning in to this from the internet I do put everything on GitHub and YouTube so you'll find the links to all of that in the description of this video so if we go here to my GitHub repository you'll see that I have a number of repos here we're dealing with the application of deep learning i also teach a generative AI class so this is how I like to think of the AI world you've got AI which is everything this is basically just making machines act like humans essentially machine learning is when you learn from data and there's a lot of applications of that deep learning is specifically neural networks and then generative AI exists pretty well completely within the realm of deep learning there's there's some aspects of it certainly that are not and then you've also got predictive AI this is what I think of your classic data science where you're trying to predict things computer vision I put into this as well you're giving it input and it's predicting some sort of a an output versus generative AI where it's things like text to text where you give it text it gives you text back or image to image where you give it an image it applies some filtering to it maybe it takes black and white to color something like that or text to image you describe something that you wanted to create and it creates it for you so these two really are the the world of the of of my two classes we are dealing with predictive AI you can find links to the other course as well if you're interested in it and it will be offered in the fall so all of this is on GitHub and on YouTube so let's pop into applications of deep learning there'll be a link to this you'll see that we are basically in the readme file here and it gives you all the important links and everything i do need to update that to the summer but all the dates in here are officially the summer dates the summer class is ran quite a bit faster than your typical semester class so you'll see that these modules in the fall it would be one module per week but here you can see we have module one the first week and then we have uh these two modules together and you'll have a lot of times where you have two modules together so we're going at double speed quite a few of the weeks now the class the assignments for this class you will have 10 programming assignments and they're all in this assignments directory if you're checking this out from the internet you can certainly look at these you won't be able to submit them for grade i'll show you students of war how to submit these when we meet for class the first time in summer this is a completely online class so we will meet we'll meet via Zoom there's also a icebreaker at the beginning this is just for you to post in Canvas in the Worshoe system and get to know each other because we're going to get into something that is a Kaggle competition the Kaggle competition is basically a um it's it's Kaggle and I'm going to create a data set for all of you to compete against each other and we'll see according to the leaderboard where everybody lands on this you will be able to do this in teams just like in real Kaggle competitions and then there's a final project i'm still figuring out exactly i'm going to upgrade this this used to be a paper but I mean come on in the world of chat GPT does anybody does any professor really assign papers because let's be real if you if I assign you a paper you're going to have chat GPT write it and let's be real I'm going to have ChatGpt grade it so what is the point in that you'll have my chatbot talk to your chatbot this will probably be something on Vibe coding i need to kind of put that together uh still but that'll be ready by the time that we get to it so these are all of the assignments this is how you will be assessed in the course so let's jump right into the first module so we're looking at all of these in GitHub github's great and all but you're going to probably want to edit them make changes and it just looks better if you open it up actually in Collab and now you're actually running Python code in here so I mean you could say print hello world whatever you want to say comma 2 + 2 and you can run this and it will actually spin up a virtual machine and run it for you they don't give you really really super advanced machines for free you can see that I do have a subscription version but you should be just fine with collab free you can also run all of this code on your local computer i'm gonna recommend that unless you like really setting up a lot of especially if you're going to try to get the GPU to work i would suggest running it through Collab there's virtually nothing in this course that is going to require you to have a GPU though having a GPU will certainly cause things to run faster so you can see there the big the big four of deep learning who really kind of brought AI back out of one of its winters and into the forefront so they launched deep learning and then before we even had another sort of AI winter we had generative AI so I mean this these are amazing times truly for artificial intelligence yan Lern is French Canadian who did a lot of the computer vision we'll definitely be dealing with some of his contributions convolution neural networks jeffrey Henton obviously the created back propagation godfather of neural networks yosua Benjio another I mean a lot of these are Canadian and created uh many of the the algorithms particularly some of the generative adversarial neural networks that in many ways gave rise to some of what we see with generative AI andrew Ning who I have taken so many of his courses amazing amazing instructor the first three of these individuals did win the touring prize unfortunately you can't have four people win the touring prize the touring prize is sort of like the Nobel Prize of computer science because computer scientists can't really win the Nobel Prize aha but then then came Jeffrey Henton who who who showed that computer scientists um people outside of physics can win the physics uh Nobel Prize so Jeffrey Hinton has won the touring and the Nobel Prize i don't know that anybody has won both of those be a great question for chat GPT so what we're doing in this course traditional software development is where you put input data into the computer and you wrote program code and it produced an output for you now with machine learning program you put input data into the computer you give it the output and it trains on it and it gives you a model which is basically your program code so you're teaching an artificial neural network to be able to produce output according to that input data and the thing is when you have new input data that you've never seen the output for it's going to make a prediction so you can program it on say the stock market up to a certain date and you're giving it the input you're giving it the output how well the the the stocks actually performed and then it gives you a model that in theory will will predict future movements in the stock market now I'm still working for a living so obviously I haven't figured that one out yet these are the types of applications of machine learning particularly for neural networks you have computer vision this is really the bread and butter of PyTorch and the neural networks that we're dealing with tabular data okay maybe that's that's data that fits into Excel you've got nice rows and columns and all that kind of stuff uh you'd be better off with a gradient boosted machine than a neural network natural language processing this is another one that neural networks have just dominated i don't think especially with generative AI I don't think you hardly use traditional natural language processing anymore you you use it when you want highly deterministic results perhaps reinforcement learning this is used a lot by self-driving cars some of the amazing things that we've learned about chess and beating go players has been there time series that's the kind of the stock market prediction time series interestingly is is connected very closely with natural language processing because natural language processing is really kind of like time series you've got letters occurring over time and generative AI oh my gosh just literally four years ago when I would teach this class I would be like \"Yeah and we've got this weird thing generative AI you can create human faces with it.\" And and oh my gosh it had I would have never guessed that I would create an entire class on generative AI it has it has taken the world by storm i mean those of you that have been doing this since I don't know since at least five years did did you see generative AI coming i mean it came like a Mac truck so we have regression classification regression is where the neural network is taking in numbers and predicting another number like some risk score or like you might give it cars and it tries to predict the miles per gallon for a car how efficient the car is another data set that you will see is the iris data set where you you you give it some measures of a particular type of flower and then it's going to attempt to predict it's going to predict the class classification it's going to classify it as one of three iris species those are very simple examples but that's where we'll start at least a little bit why deep learning there are a lot of other machine learning constructs support vector machines random force and gradient boosting are among the top ones that I've dealt with that is really it's if you're doing tabular data yeah use one of these three but if you're using highly unstructured data and most of the interesting data in the world is unstructured you'll probably want to use deep learning why Python python has taken the world by storm propelled a lot by AI it's it's a easily approachable language i do expect that you've done some programming before this class particularly Python there there have been people who have picked this up as they go you'll hear me refer to vibe coding vibe coding is where you have chat GPT help you a lot on this and that is that is perfectly acceptable to use generative AI in this class is absolutely not cheating you can use it for anything that you want to in this class i'm not going to tell you that something is cheating when as soon as you work in industry they're going to tell you use use generative AI because you need to know this stuff to survive in the in the career field uh believe me this is this is coming fast you will have a few tokens and keys in this class so I'm going to send you a homework submission API key you should just wore students obviously you should get that emailed to me by the first class session you'll get a you'll get an announcement in Canvas telling you all about that you'll need to create a hugging face key and an open and I will give you an open AI key it's just a sample one that you'll use for the one session that we deal with generative AI in this class and then if you just want to run uh this program just to demonstrate this shows you the current version if you have a GPU by the way if you want to use Apple Metal so M1 M2 kind of stuff everything in this course should be compatible with Apple Metal and then we get to the first assignment the first assignment is really pretty easy all you have to do is put your key into it and run it this is just to prove that you can actually execute Python code and that you can put the key in and run it module two you'll get to do some actual coding so this is everything uh welcome to this semester i look forward to to uh working with all of you and seeing you on the first Zoom call and thank you for watching this video and if you want to subscribe to the channel you'll get any updates that I do i do this class the other class as well as a lot of projects that I find interesting using Gen AI using Gen AI to generate the code uh as well as the things that humans still need to do for programming this stuff so thank you for watching if this is useful you know smash that like button";

//     const response = await fetch(
//         `${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}/questions`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Cookie: request.headers.get("cookie") || "",
//             },
//             body: JSON.stringify({
//                 video_id: video_id,
//                 title: title,
//                 description: description,
//                 transcript: transcript
//             })
//         }
//     );

//     try {
//         // Check if response is ok before parsing
//         if (!response.ok) {
//             console.error(`Error response: ${response.status} ${response.statusText}`);
//             // Read the response text for debugging
//             const errorText = await response.text();
//             console.error(`Response body: ${errorText}`);
//             return NextResponse.json({
//                 status: response.status,
//                 error: response.statusText,
//                 details: errorText || "No response body"
//             }, { status: 500 });
//         }

//         // Only try to parse JSON for successful responses
//         const data = await response.json();
//         return NextResponse.json({
//             status: response.status,
//             data,
//         });
//     } catch (error) {
//         console.error("Error parsing response:", error);
//         return NextResponse.json({
//             status: 500,
//             error: "Failed to parse response",
//             details: error instanceof Error ? error.message : String(error)
//         }, { status: 500 });
//     }
// }

// api/v1/videos/[url]/extension/process/route.ts
export async function GET(request: NextRequest) {
    const youtubeUrl = encodeURIComponent(
        "https://www.youtube.com/watch?v=7XIv3Bko1aA"
    );
    const videoId = "7XIv3Bko1aA";
    const authToken =
        "7wplB57D5v4lM2tQTDcrOLFuKTU1rdXkQUulEDplm3RTcTOh5hsmclpqBG3UvRYE";
    const processType = "automatic";
    console.log("TEST ROUTE CALLED", { youtubeUrl, videoId });
    const response = await fetch(
        `${request.nextUrl.origin}/api/v1/videos/${youtubeUrl}/extension/process`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({
                videoId,
                authToken,
                processType,
            }),
        }
    );

    try {
        // Check if response is ok before parsing
        if (!response.ok) {
            console.error(
                `Error response: ${response.status} ${response.statusText}`
            );
            // Read the response text for debugging
            const errorText = await response.text();
            console.error(`Response body: ${errorText}`);
            return NextResponse.json(
                {
                    status: response.status,
                    error: response.statusText,
                    details: errorText || "No response body",
                },
                { status: 500 }
            );
        }

        // Only try to parse JSON for successful responses
        const data = await response.json();
        return NextResponse.json({
            status: response.status,
            data,
        });
    } catch (error) {
        console.error("Error parsing response:", error);
        return NextResponse.json(
            {
                status: 500,
                error: "Failed to parse response",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
