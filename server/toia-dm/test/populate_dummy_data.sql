-- input a user
INSERT INTO toia_user(id,first_name,last_name,language,email,password) VALUES (1,"Jon","Doe","en-US","jon.doe@gmail.com","abc123");
-- input videos
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("ef1","answer",1,1,0,"How are you?","I am fine thanks!","en-US",5,14);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("0b2","answer",1,2,0,"What is your favorite sport?","I love soccer!","en-US",2,5);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("a7c","answer",1,3,0,"What do you study?","I study Computer Science.","en-US",10,34);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("o8i","answer",1,4,1,"Where do you live?","I live in Abu Dhabi.","en-US",0,2);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r21","asnwer",1,5,0,"When is your birthday?","My birthday is in September.","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2t","y/n-answer",1,13,0,"Do you like sushi?","Yes","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r4t","y/n-answer",1,14,0,"Do you like swimming?","No","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2y","no-answer",1,15,0,"","I don't have an answer for that","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2e","greeting",1,16,0,"hey","how's it going?","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2m","greeting",1,6,0,"Howdy","hey, I'm all right","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2a","answer",1,7,0,"What do you do?","I am doing a Ph.D.","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2b","answer",1,8,0,"How old are you?","I'm 35. Age last birthday","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2c","answer",1,9,0,"Tell me something interesting?","I wrote a book about the ethics of artificial intelligence","en-US", 4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2d","filler",1,10,0,"When is your birthday?","My birthday is in September.","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2f","greeting",1,11,0,"Hello","Hi!","en-US",4,20);
INSERT INTO video(id_video,type,toia_id,idx,private,question,answer,language,likes,views) VALUES("r2h","no-answer",1,12,0,"","Sorry, I didn't get that","en-US",4,20);
-- input stream

-- link videos to stream
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"ef1");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"0b2");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"a7c");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"o8i");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r21");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2t");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r4t");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2y");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2e");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2m");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2a");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2b");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2c");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2d");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2f");
INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(1,"r2h");