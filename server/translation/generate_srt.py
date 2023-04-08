import json
from google.cloud import storage
import os
import shutil
from dotenv import load_dotenv

from msg2srt import msg2srt
from translate_txt import copy_to_local
from txt2srt import txt2srt
from translate_txt import batch_translate_text


def generate_srt(data, target_langs, video_name, output_file="en", input_language="en-US", max_chars=40):

    load_dotenv()
    env = os.getenv('ENVIRONMENT')
    print(f"{env}: Generating SRT files from queue...")
    print(f"Transcript: {data}")

    video_name = video_name.split('.')[0]
    INPUT_BUCKET = os.getenv('INPUT_BUCKET')
    OUTPUT_BUCKET = os.getenv('OUTPUT_BUCKET')
    INPUT_URI = os.getenv('INPUT_URI') + output_file + '.txt'
    OUTPUT_URI = os.getenv('OUTPUT_URI')
    PROJECT_ID = os.getenv('PROJECT_ID')
    SUBTITLES = os.getenv('SUBTITLE_BUCKET')

    transcript_srt = f'srts/{output_file}.srt'

    msg2srt(data, max_chars, output_file, input_language)
    copy_txt(output_file, INPUT_BUCKET, PROJECT_ID)
    clear_bucket(OUTPUT_BUCKET, PROJECT_ID)
    batch_translate_text(INPUT_URI, OUTPUT_URI, PROJECT_ID,
                         input_language, target_lang=target_langs)
    copy_to_local("txts", OUTPUT_BUCKET, PROJECT_ID)
    txt2srt(transcript_srt, txt_out="txts", srt_out="srts", vtt_out="vtts")
    if env == "PRODUCTION":
        upload_to_bucket(SUBTITLES, PROJECT_ID, video_name)
    elif env == "DEVELOPMENT":
        upload_to_folders("files", video_name)
    clear_folders()
    print("Finished writing to srt/vtt files.")


def copy_txt(output_file, bucket_in, project_id):
    storage_client = storage.Client(project_id)
    bucket = storage_client.get_bucket(bucket_in)
    filename = f'{output_file}.txt'
    blob = bucket.blob(filename)
    blob.upload_from_filename(f'txts/{filename}')


def clear_bucket(bucket_out, project_id):
    storage_client = storage.Client(project_id)
    blobs = storage_client.list_blobs(bucket_out)
    for blob in blobs:
        blob.delete()


def upload_to_bucket(subtitles, project_id, video_name):
    storage_client = storage.Client(project_id)
    bucket = storage_client.get_bucket(subtitles)

    for f in os.listdir("vtts"):
        blob = bucket.blob(f'{video_name}-{f}')
        blob.upload_from_filename(f'{f}')


def clear_folders():
    dirs = ["txts", "srts", "vtts"]
    for dir in dirs:
        for f in os.listdir(dir):
            os.remove(os.path.join(dir, f))


def upload_to_folders(folder_name, video_name):
    for f in os.listdir("vtts"):
        shutil.copyfile(f'vtts/{f}', f'{folder_name}/vtts/{video_name}-{f}')