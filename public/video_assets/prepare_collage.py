import os
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

BASE_DIR = r"C:\Users\AsusTUF\.gemini\antigravity\scratch\pklp-interactive-video\public\video_assets"
REF_PATH = os.path.join(BASE_DIR, "trunk_ref_open.jpg")

def create_collage_elements():
    src = Image.open(REF_PATH).convert("RGBA")
    w, h = src.size

    # 1. Vintage Photo of students (roughly around (130, 370) to (290, 560) normalized)
    # Let's crop relative to image dimensions
    p1_box = (int(w * 0.11), int(h * 0.36), int(w * 0.29), int(h * 0.58))
    photo1 = src.crop(p1_box)

    # 2. Handwritten letters tied with twine
    p2_box = (int(w * 0.16), int(h * 0.46), int(w * 0.45), int(h * 0.65))
    photo2 = src.crop(p2_box)

    # 3. Old building photo & book
    p3_box = (int(w * 0.36), int(h * 0.37), int(w * 0.52), int(h * 0.56))
    photo3 = src.crop(p3_box)

    def style_card(img, border_color=(235, 225, 205), border_w=12):
        # Add white/sepia archival border and soft shadow
        bw = img.width + border_w * 2
        bh = img.height + border_w * 2
        card = Image.new("RGBA", (bw, bh), border_color + (255,))
        card.paste(img, (border_w, border_w))

        # Add drop shadow
        pad = 30
        shadow_canvas = Image.new("RGBA", (bw + pad * 2, bh + pad * 2), (0, 0, 0, 0))
        shadow = Image.new("RGBA", (bw, bh), (0, 0, 0, 160))
        shadow_canvas.paste(shadow, (pad + 4, pad + 10))
        shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(14))
        shadow_canvas.paste(card, (pad, pad), card)
        return shadow_canvas

    card1 = style_card(photo1)
    card2 = style_card(photo2)
    card3 = style_card(photo3)

    card1.save(os.path.join(BASE_DIR, "collage_item1.png"))
    card2.save(os.path.join(BASE_DIR, "collage_item2.png"))
    card3.save(os.path.join(BASE_DIR, "collage_item3.png"))
    print("Collage archival cards created successfully!")

if __name__ == "__main__":
    create_collage_elements()
