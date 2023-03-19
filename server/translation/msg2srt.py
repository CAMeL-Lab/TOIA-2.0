# -*- coding: utf-8 -*-
#
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import srt
from datetime import timedelta
import webvtt

def break_sentences(max_chars, subs, words, prev_end_time):
    firstword = True
    charcount = 0
    idx = len(subs) + 1
    content = ""

    shift = prev_end_time if prev_end_time else timedelta(seconds=0)

    for w in words:
        if firstword:
            # first word in sentence, record start time
            start = timedelta(seconds=int(w.startTime.seconds), microseconds = int(w.startTime.nanos)/1000) + shift

        charcount += len(w.word)
        content += " " + w.word.strip()

        if ("." in w.word or "!" in w.word or "?" in w.word or
                charcount > max_chars or
                ("," in w.word and not firstword)):
            # break sentence at: . ! ? or line length exceeded
            # also break if , and not first word
            subs.append(srt.Subtitle(index=idx,
                                     start=start,
                                     end=timedelta(seconds = int(w.endTime.seconds), microseconds = int(w.endTime.nanos)/1000) + shift,
                                     content=srt.make_legal_content(content)))
            firstword = True
            idx += 1
            content = ""
            charcount = 0
        else:
            firstword = False
    
    if content:
        subs.append(srt.Subtitle(index=idx,
                                    start=start,
                                    end=timedelta(seconds = int(w.endTime.seconds), microseconds = int(w.endTime.nanos)/1000) + shift,
                                    content=srt.make_legal_content(content)))

    return subs, timedelta(seconds = int(w.endTime.seconds), microseconds = int(w.endTime.nanos)/1000) + shift


def write_srt(out_file, language_code, subs):
    srt_file = f'srts/{out_file}.srt'
    print("Writing {} subtitles to: {}".format(language_code, srt_file))
    f = open(srt_file, 'w')
    f.writelines(srt.compose(subs))
    f.close()
    return


def write_txt(out_file, subs):
    txt_file = f'txts/{out_file}.txt'
    print("Writing text to: {}".format(txt_file))
    f = open(txt_file, 'w')
    for s in subs:
        f.write(s.content.strip() + "\n")
    f.close()
    return

def msg2srt(results, max_chars, out_file, language_code):
    subs = []
    prev_end_time = None
    for words in results:
        subs, prev_end_time = break_sentences(max_chars, subs, words, prev_end_time)

    write_srt(out_file, language_code, subs)
    write_txt(out_file, subs)
    
    vtt = webvtt.from_srt(f'srts/{out_file}.srt')
    vtt.save(f'vtts/{out_file}.vtt')