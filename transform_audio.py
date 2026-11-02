import sys
import os
import subprocess
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

def transform(input_path, output_path, preset="old_man", semitones=0, speed=1.0):
    # Presets definition
    # semitones to rate factor: 2^(semitones / 12)
    # Using ffmpeg rubberband or asetrate+atempo
    if preset == "old_man":
        # Pitch down ~4.5 semitones, deep chest resonance, aged vocal frequency
        factor = 0.77
        tempo_comp = 1.0 / factor
        filter_str = f"asetrate=44100*{factor},atempo={tempo_comp},equalizer=f=200:width_type=o:width=1.2:g=5,equalizer=f=3500:width_type=o:width=1:g=-3,afftdn"
    elif preset == "old_lady":
        # Mature woman pitch, subtle aging tremolo
        factor = 0.90
        tempo_comp = 1.0 / factor
        filter_str = f"asetrate=44100*{factor},atempo={tempo_comp},equalizer=f=350:width_type=o:width=1:g=3,equalizer=f=3000:width_type=o:width=1:g=-2,tremolo=f=4.5:d=0.2,afftdn"
    elif preset == "boy":
        # Youth pitch up ~4 semitones, lighter throat formant
        factor = 1.25
        tempo_comp = 1.0 / factor
        filter_str = f"asetrate=44100*{factor},atempo={tempo_comp},equalizer=f=250:width_type=o:width=1:g=-4,equalizer=f=2400:width_type=o:width=1:g=3,afftdn"
    elif preset == "narrator":
        # Radio studio presence, warm bass, clarity
        filter_str = "equalizer=f=120:width_type=o:width=1:g=4,equalizer=f=4500:width_type=o:width=1:g=3,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,afftdn"
    else:
        # Custom semitones (-12 to +12)
        factor = 2 ** (float(semitones) / 12.0)
        tempo_comp = (1.0 / factor) * float(speed)
        # ffmpeg atempo supports 0.5 to 2.0; chain if necessary
        tempo_filters = []
        rem = tempo_comp
        while rem > 2.0:
            tempo_filters.append("atempo=2.0")
            rem /= 2.0
        while rem < 0.5:
            tempo_filters.append("atempo=0.5")
            rem /= 0.5
        tempo_filters.append(f"atempo={rem}")
        tempo_str = ",".join(tempo_filters)
        filter_str = f"asetrate=44100*{factor},{tempo_str},afftdn"

    cmd = [
        FFMPEG, "-y",
        "-i", input_path,
        "-af", filter_str,
        "-c:a", "libmp3lame", "-b:a", "192k",
        output_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Transformed audio written to:", output_path)

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        inp = sys.argv[1]
        out = sys.argv[2]
        pre = sys.argv[3] if len(sys.argv) > 3 else "old_man"
        semi = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
        spd = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
        transform(inp, out, pre, semi, spd)
    else:
        print("Usage: python transform_audio.py <input> <output> [preset] [semitones] [speed]")
