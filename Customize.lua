Customize = {}

-- General
Customize.Command           = 'shotmaker'
Customize.MenuCommand       = 'wardrobe'
Customize.AceRestricted     = false          -- true = ACE permission required (see README)
Customize.RoutingBucket     = 999

Customize.ScreenshotQuality = 0.92          -- 0.0–1.0 (webp/jpg only)
Customize.ScreenshotFormat  = 'png'         -- 'png' | 'webp' | 'jpg'
Customize.TransparentBg     = true          -- chroma key removal (png only)
Customize.ScreenshotWidth   = 512
Customize.ScreenshotHeight  = 512

-- Auto-Crop — trims empty space around the subject after chroma key removal,
-- then scales the subject to fill the output canvas (fit-to-contain, centred).
-- Requires TransparentBg = true and ScreenshotFormat = 'png'.
-- Result: the clothing/vehicle/object fills ~90 %+ of the image instead of
-- sitting in a sea of transparent pixels.
Customize.AutoCrop          = true          -- enable automatic subject crop
Customize.AutoCropPadding   = 8             -- px of breathing room added around the tight bbox
Customize.AutoCropThreshold = 10            -- alpha threshold: pixels with alpha < this are "empty"
Customize.AutoCropMode      = 'alpha'       -- 'alpha' (transparent bg only)
                                            -- 'dark'  (dark/black bg, no alpha)
                                            -- 'both'  (either condition counts as empty)

Customize.StudioCoords      = vector3(0.0, 0.0, -150.0)
Customize.StudioHeading     = 180.0

Customize.WaitAfterApply    = 500           -- ms
Customize.WaitAfterCapture  = 300           -- ms
Customize.TextureLoadWait   = 600           -- ms
Customize.CaptureAllTextures = false        -- true = all textures, false = texture 0 only

-- Batch / Performance
Customize.BatchSize         = 10
Customize.BatchPauseWait    = 2000          -- ms
Customize.GCInterval        = 20
Customize.LatentRate        = 8000000       -- bytes/sec for capture upload (latent event throttle).
                                            -- 8 MB/s is plenty for 512x512; raise for 4K source frames
                                            -- (e.g. 16000000 = 16 MB/s) if uploads bottleneck the queue.

-- Chroma Key Screen
Customize.ChromaKeyColor    = 'green'          -- 'green' | 'magenta'

Customize.GreenScreen = {
    width       = 8.0,
    depth       = 8.0,
    height      = 8.5,
    floorOffset = -3.0,
}

-- Head Chroma Mask — covers the ped's head with chroma color so the server
-- can wipe it out for accessory/torso shots (configured per category via
-- the `hideHead = true` flag). Each entry is a sphere centered on SKEL_Head
-- plus its own offsets, sized by sizeX/Y/Z, and optionally rotated by
-- rotX/rotY/rotZ (degrees).
--
-- Stack multiple entries to cover head + jaw + neck independently — small
-- spheres tucked exactly where they're needed beat one big sphere that has
-- to compromise between clipping clothing or leaving skin visible.
--
-- Rotation is around the marker center. With unequal sizeX/Y/Z (ellipsoid)
-- you can tilt the shape — e.g. rotX > 0 pitches the sphere's long axis
-- downward, which is useful for following the slope of the neck under the
-- chin without expanding into the chest area.
Customize.HeadMask = {
    { offsetX = 0.0, offsetY = 0.0, offsetZ = 0.136, sizeX = 0.12, sizeY = 0.15, sizeZ = 0.315 },
}

-- Auto-set screen color from preset (do not edit manually)
Customize.GreenScreen.color = Customize.ChromaKeyColor == 'magenta'
    and { r = 255, g = 0, b = 255 }
    or  { r = 0,   g = 177, b = 64 }

-- Studio Lights
Customize.StudioLights = {
    { offset = vector3(0.0, 2.5, 1.0),  range = 8.0, intensity = 3.0 },
    { offset = vector3(-2.5, 0.0, 1.0), range = 5.0, intensity = 2.0 },
    { offset = vector3(2.5, 0.0, 1.0),  range = 5.0, intensity = 2.0 },
    { offset = vector3(0.0, -1.5, 1.0), range = 4.0, intensity = 1.5 },
    { offset = vector3(0.0, 0.0, 3.0),  range = 6.0, intensity = 2.5 },
}

-- Camera Presets (fov, zPos, rotation, dist, defaultAngleH, defaultCamZ, defaultRoll)
Customize.CameraPresets = {
    hair            = { fov = 25.0, zPos = 0.72,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    face_overlay    = { fov = 18.0, zPos = 0.68,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    chest_overlay   = { fov = 28.1, zPos = 0.28,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 178.9,  defaultCamZ = 0.06, defaultRoll = 0.0 },
    mask            = { fov = 25.1, zPos = 0.66,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 180.6,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    arms_gloves     = { fov = 89.4, zPos = 0.07,  rotation = vector3(0.0, 0.0, 0.0),   dist = 0.6, defaultAngleH = 180.6,  defaultCamZ = 0.09, defaultRoll = 0.0 },
    legs            = { fov = 60.0, zPos = -0.46, rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 179.9,  defaultCamZ = 0.1,  defaultRoll = 0.0 },
    shoes           = { fov = 19.0, zPos = -0.96, rotation = vector3(0.0, 0.0, 0.0),   dist = 1.3, defaultAngleH = 180.3,  defaultCamZ = 0.77, defaultRoll = 0.0 },
    accessories     = { fov = 24.0, zPos = 0.3,   rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    body            = { fov = 37.7, zPos = 0.31,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.3, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    decals          = { fov = 56.4, zPos = 0.27,  rotation = vector3(0.0, 0.0, 0.0),   dist = 0.9, defaultAngleH = 0.0,    defaultCamZ = 0.0,  defaultRoll = 0.0 },
    tops            = { fov = 34.7, zPos = 0.22,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.4, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    hats            = { fov = 21.2, zPos = 0.72,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.2, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    glasses         = { fov = 5.0,  zPos = 0.7,   rotation = vector3(0.0, 0.0, 0.0),   dist = 2.5, defaultAngleH = 180.0,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    ears            = { fov = 20.0, zPos = 0.68,  rotation = vector3(0.0, 0.0, 0.0),   dist = 1.0, defaultAngleH = 180.9,  defaultCamZ = 0.0,  defaultRoll = 0.0 },
    watches         = { fov = 17.8, zPos = -0.19, rotation = vector3(0.0, 0.0, 275.0), dist = 1.0, defaultAngleH = -85.0,  defaultCamZ = 0.45, defaultRoll = 0.0 },
    bracelets       = { fov = 21.7, zPos = -0.19, rotation = vector3(0.0, 0.0, 0.0),   dist = 1.0, defaultAngleH = -275.6, defaultCamZ = 0.5,  defaultRoll = 0.0 },
    -- vehicle         = { fov = 40.0, zPos = 0.81,  rotation = vector3(0.0, 0.0, 0.0),   dist = 8.0, defaultAngleH = 399.4,  defaultCamZ = 1.82, defaultRoll = 0.0 },
    -- object          = { fov = 35.0, zPos = 0.42,  rotation = vector3(0.0, 0.0, 0.0),   dist = 3.7, defaultAngleH = 211.8,  defaultCamZ = 0.83, defaultRoll = 0.0 },
    -- vehicle         = { fov = 15.6, zPos = -0.1, rotation = vector3(0.0, 0.0, 0.0), dist = 7.8, defaultAngleH = 399.4, defaultCamZ = 1.82, defaultRoll = 0.0 }, -- GOOD FOR MOTORCYCLES
    vehicle         = { fov = 40.0, zPos = 0.11,  rotation = vector3(0.0, 0.0, 0.0),   dist = 8.0, defaultAngleH = 399.4,  defaultCamZ = 1.82, defaultRoll = 0.0 },
    object          = { fov = 15.0, zPos = 0.01,  rotation = vector3(0.0, 0.0, 0.0),   dist = 3.7, defaultAngleH = 211.8,  defaultCamZ = 0.83, defaultRoll = 0.0 },
}

-- Clothing Categories (componentId -> camera preset)
-- visibleComponents : component IDs that remain visible at drawable 0 (e.g. 0=head, 2=hair, 3=torso)
-- componentOverrides: override specific component drawables (e.g. {[3] = 15} sets torso to drawable 15)
-- previewDrawable   : drawable shown in preview mode (default: 0)
-- hideHead          : draw a chroma-key sphere over the head during capture (removed by bg removal)
Customize.Categories = {
    { componentId = 2,  label = 'Hair',          camera = 'hair',        visibleComponents = {0}, previewDrawable = 15 },
    { componentId = 1,  label = 'Mask',          camera = 'mask',        visibleComponents = {0, 2}, previewDrawable = 23 },
    { componentId = 3,  label = 'Arms / Gloves', camera = 'arms_gloves', visibleComponents = {}, hideHead = true },
    { componentId = 4,  label = 'Pants',         camera = 'legs',        visibleComponents = {} },
    { componentId = 5,  label = 'Bags',          camera = 'decals',      visibleComponents = {}, previewDrawable = 1, hideHead = true },
    { componentId = 6,  label = 'Shoes',         camera = 'shoes',       visibleComponents = {}, previewDrawable = 1 },
    { componentId = 7,  label = 'Accessories',   camera = 'accessories', visibleComponents = {0, 3}, componentOverrides = {[3] = 15}, hideHead = true },
    { componentId = 8,  label = 'Undershirt',    camera = 'tops',        visibleComponents = {}, hideHead = true },
    { componentId = 9,  label = 'Body Armor',    camera = 'body',        visibleComponents = {}, previewDrawable = 1, hideHead = true },
    { componentId = 10, label = 'Decals',        camera = 'decals',      visibleComponents = {3}, componentOverrides = {[3] = 15}, hideHead = true },
    { componentId = 11, label = 'Tops',          camera = 'tops',        visibleComponents = {}, hideHead = true },
}

-- Prop Categories (propId -> camera preset)
-- anim: optional animation played during capture (dict, name, flag)
Customize.PropCategories = {
    { propId = 0, label = 'Hats',      camera = 'hats',      visibleComponents = {0, 2} },
    { propId = 1, label = 'Glasses',   camera = 'glasses',   visibleComponents = {0, 2}, previewDrawable = 2 },
    { propId = 2, label = 'Ears',      camera = 'ears',      visibleComponents = {0, 2} },
    { propId = 6, label = 'Watches',   camera = 'watches',   visibleComponents = {3}, anim = { dict = 'anim@heists@ornate_bank@grab_cash', name = 'grab', flag = 49 } },
    { propId = 7, label = 'Bracelets', camera = 'bracelets', visibleComponents = {3}, anim = { dict = 'anim@heists@ornate_bank@grab_cash', name = 'grab', flag = 49 } },
}

-- Head Overlay Categories (overlayIndex -> camera preset)
-- Uses SetPedHeadOverlay / GetPedHeadOverlayNum natives
-- colorType: 1 = hair color (eyebrows, facial hair), 2 = makeup color (makeup, blush, lipstick)
-- colorId: overlay color index (1 = black)
Customize.OverlayCategories = {
    -- Face overlays
    { overlayIndex = 0,  label = 'Blemishes',          camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 1,  label = 'Facial Hair',        camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 2,  label = 'Eyebrows',           camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 3,  label = 'Ageing',             camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 4,  label = 'Makeup',             camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 2, colorId = 1 },
    { overlayIndex = 5,  label = 'Blush',              camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 2, colorId = 1 },
    { overlayIndex = 6,  label = 'Complexion',         camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 7,  label = 'Sun Damage',         camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    { overlayIndex = 8,  label = 'Lipstick',           camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 2, colorId = 1 },
    { overlayIndex = 9,  label = 'Moles & Freckles',   camera = 'face_overlay',  visibleComponents = {0, 2}, colorType = 1, colorId = 1 },
    -- Body overlays
    { overlayIndex = 10, label = 'Chest Hair',         camera = 'chest_overlay', visibleComponents = {0, 2, 3}, componentOverrides = {[3] = 15}, colorType = 1, colorId = 1 },
    { overlayIndex = 11, label = 'Body Blemishes',     camera = 'chest_overlay', visibleComponents = {0, 2, 3}, componentOverrides = {[3] = 15}, colorType = 1, colorId = 1 },
}

-- Vehicle Categories
-- 'auto' = auto-detect all loaded vehicle models via GetAllVehicleModels()
-- Or use a manual list: { { model = 'adder', label = 'Adder' }, ... }
-- Customize.VehicleCategories = 'auto'
Customize.VehicleCategories = {
    { model = "x7m60iprzemo", label = "x7m60iprzem bmw"},
    { model = "x7m60i", label = "BMWX71 X7M60I"},
    { model = "x6mpd", label = "BMW x6mpd"},
    { model = "x6mlarte", label = "BMW x6mlarte"},
    { model = "x6mf96lbwk", label = "BMWX61 x6mf96lbwk"},
    { model = "x6mf96", label = "BMWX61 X6MF96"},
    { model = "x6mf16", label = "BMW X6MF16"},
    { model = "x6m47", label = "BMWX61 x6m47"},
    { model = "x6m", label = "BMW X6M 201 X6M"},
    { model = "x5xdriver", label = "x5xdriver x5xdriver"},
    { model = "x5mre", label = "x5mre x5mre"},
    { model = "x5mraid", label = "BMW x5mraid"},
    { model = "x3m4gt322", label = "BMW M4 GT3 2022"},
    { model = "x3m3tour22", label = "BMW M3 Touring "},
    { model = "vanzi8wb", label = "vanzi8wb i8 Wide Bod"},
    { model = "tppz4", label = "BMW Z4 Stanced"},
    { model = "supere36", label = "BMW supere36"},
    { model = "streetfighter", label = "nissan Street Figh"},
    { model = "sj315ti", label = "sj315ti sj315ti"},
    { model = "sharkm4", label = "Chevorlet sharkm4"},
    { model = "rmodm5e34", label = "Mercedes-AM rmodm5e34"},
    { model = "rmodm4", label = "BMW rmodm4"},
    { model = "razerm4", label = "Mitsubishi razerm4"},
    { model = "razere60m5", label = "mitsubshi razere60m5"},
    { model = "razere46wide", label = "Lamborghini razere46wid"},
    { model = "owlalpina", label = "owlalpina owlalpina"},
    { model = "mh760custom", label = "BMW MH760 L"},

    -- { model = "x7m60iprzemo", label = "x7m60iprzemo"},
    -- { model = "x7m60i", label = "x7m60i"},
    -- { model = "x6mpd", label = "x6mpd"},
    -- { model = "x6mlarte", label = "x6mlarte"},
    -- { model = "x6mf96lbwk", label = "x6mf96lbwk"},
    -- { model = "x6mf96", label = "x6mf96"},
    -- { model = "x6mf16", label = "x6mf16"},
    -- { model = "x6m47", label = "x6m47"},
    -- { model = "x6m", label = "x6m"},
    -- { model = "x5xdriver", label = "x5xdriver"},
    -- { model = "x5mre", label = "x5mre"},
    -- { model = "x5mraid", label = "x5mraid"},
    -- { model = "x3m4gt322", label = "x3m4gt322"},
    -- { model = "x3m3tour22", label = "x3m3tour22"},
    -- { model = "vanzi8wb", label = "vanzi8wb"},
    -- { model = "tppz4", label = "tppz4"},
    -- { model = "supere36", label = "supere36"},
    -- { model = "streetfighter", label = "streetfighter"},
    -- { model = "sj315ti", label = "sj315ti"},
    -- { model = "sharkm4", label = "sharkm4"},
    -- { model = "rmodm5e34", label = "rmodm5e34"},
    -- { model = "rmodm4", label = "rmodm4"},
    -- { model = "razerm4", label = "razerm4"},
    -- { model = "razere60m5", label = "razere60m5"},
    -- { model = "razere46wide", label = "razere46wide"},
    -- { model = "owlalpina", label = "owlalpina"},
    -- { model = "mh760custom", label = "mh760custom"},
    -- { model = "mh1500wb", label = "mh1500wb"},
    -- { model = "mansm4", label = "mansm4"},
    -- { model = "maddrifte30", label = "maddrifte30"},
    -- { model = "m8khann", label = "m8khann"},
    -- { model = "m8keyvany", label = "m8keyvany"},
    -- { model = "m8f91", label = "m8f91"},
    -- { model = "m8cabrio2ncsc", label = "m8cabrio2ncsc"},
    -- { model = "m8cabrio2ncs", label = "m8cabrio2ncs"},
    -- { model = "m760manhart", label = "m760manhart"},
    -- { model = "m6f13al", label = "m6f13al"},
    -- { model = "m6f13", label = "m6f13"},
    -- { model = "m5prime", label = "m5prime"},
    -- { model = "m5perf16", label = "m5perf16"},
    -- { model = "m5per", label = "m5per"},
    -- { model = "m5e61przemo", label = "m5e61przemo"},
    -- { model = "m5e60wb1", label = "m5e60wb1"},
    -- { model = "m5e60", label = "m5e60"},
    -- { model = "m5csdyb", label = "m5csdyb"},
    -- { model = "m5cs22", label = "m5cs22"},
    -- { model = "m5abflug", label = "m5abflug"},
    -- { model = "m5", label = "m5"},
    -- { model = "m4speedhunter", label = "m4speedhunter"},
    -- { model = "m4shark", label = "m4shark"},
    -- { model = "m4pdc", label = "m4pdc"},
    -- { model = "m4mafia", label = "m4mafia"},
    -- { model = "m4lb", label = "m4lb"},
    -- { model = "m4hycade21", label = "m4hycade21"},
    -- { model = "m4hycade", label = "m4hycade"},
    -- { model = "m4hs", label = "m4hs"},
    -- { model = "m4hr", label = "m4hr"},
    -- { model = "m4g82c", label = "m4g82c"},
    -- { model = "m4g82p", label = "m4g82p"},
    -- { model = "m4g82", label = "m4g82"},
    -- { model = "m4f82sc", label = "m4f82sc"},
    -- { model = "m4f82", label = "m4f82"},
    -- { model = "m4cvo", label = "m4cvo"},
    -- { model = "m4cs18", label = "m4cs18"},
    -- { model = "m4", label = "m4"},
    -- { model = "m4cs", label = "m4cs"},
    -- { model = "m4comp", label = "m4comp"},
    -- { model = "m4cevo", label = "m4cevo"},
    -- { model = "m4camper", label = "m4camper"},
    -- { model = "m4c20", label = "m4c20"},
    -- { model = "m4c", label = "m4c"},
    -- { model = "m4beast", label = "m4beast"},
    -- { model = "m40i", label = "m40i"},
    -- { model = "m3tou", label = "m3tou"},
    -- { model = "m3tdy", label = "m3tdy"},
    -- { model = "m3touring", label = "m3touring"},
    -- { model = "m3ptouring", label = "m3ptouring"},
    -- { model = "m3mafia", label = "m3mafia"},
    -- { model = "m3gtr", label = "m3gtr"},
    -- { model = "m3g80mp", label = "m3g80mp"},
    -- { model = "m3g80c", label = "m3g80c"},
    -- { model = "m3g8021", label = "m3g8021"},
    -- { model = "m3f81", label = "m3f81"},
    -- { model = "M3F80Vision", label = "M3F80Vision"},
    -- { model = "m3f80", label = "m3f80"},
    -- { model = "m3e36przemo", label = "m3e36przemo"},
    -- { model = "m3e30", label = "m3e30"},
    -- { model = "m3e", label = "m3e"},
    -- { model = "M3BXANE", label = "M3BXANE"},
    -- { model = "m335e92", label = "m335e92"},
    -- { model = "m330jahre", label = "m330jahre"},
    -- { model = "m2track", label = "m2track"},
    -- { model = "m2shark", label = "m2shark"},
    -- { model = "m2keyvany", label = "m2keyvany"},
    -- { model = "m2g87", label = "m2g87"},
    -- { model = "m2fd20", label = "m2fd20"},
    -- { model = "m2fd", label = "m2fd"},
    -- { model = "m2edit", label = "m2edit"},
    -- { model = "m2dy", label = "m2dy"},
    -- { model = "m2cs20", label = "m2cs20"},
    -- { model = "m2", label = "m2"},
    -- { model = "m140ibrando", label = "m140ibrando"},
    -- { model = "m135i", label = "m135i"},
    -- { model = "libertym4cs", label = "libertym4cs"},
    -- { model = "ikx3m4csl22", label = "ikx3m4csl22"},
    -- { model = "if40", label = "if40"},
    -- { model = "I8", label = "I8"},
    -- { model = "hpfm8", label = "hpfm8"},
    -- { model = "GODzLBi8", label = "GODzLBi8"},
    -- { model = "GODzKSTERZOTACH", label = "GODzKSTERZOTACH"},
    -- { model = "GODzHYCADER34", label = "GODzHYCADER34"},
    -- { model = "GODzE46M3VERT", label = "GODzE46M3VERT"},
    -- { model = "GODzE46M3PNDMVERT", label = "GODzE46M3PNDMVERT"},
    -- { model = "GODzE46M3PNDM", label = "GODzE46M3PNDM"},
    -- { model = "GODzE46M3LAVERT", label = "GODzE46M3LAVERT"},
    -- { model = "GODzE46M3LA", label = "GODzE46M3LA"},
    -- { model = "GODz21M3", label = "GODz21M3"},
    -- { model = "GC_BMWM5", label = "GC_BMWM5"},
    -- { model = "gcmm52021", label = "gcmm52021"},
    -- { model = "g20wide", label = "g20wide"},
    -- { model = "g20stock", label = "g20stock"},
    -- { model = "fbm52016touring", label = "fbm52016touring"},
    -- { model = "f82", label = "f82"},
    -- { model = "f82st", label = "f82st"},
    -- { model = "f82duke", label = "f82duke"},
    -- { model = "f824slw", label = "f824slw"},
    -- { model = "f82lw", label = "f82lw"},
    -- { model = "f82hs", label = "f82hs"},
    -- { model = "e92", label = "e92"},
    -- { model = "e91unm", label = "e91unm"},
    -- { model = "e60", label = "e60"},
    -- { model = "E46sedanwide", label = "E46sedanwide"},
    -- { model = "e46m3", label = "e46m3"},
    -- { model = "e46faceliftv2", label = "e46faceliftv2"},
    -- { model = "e30ks", label = "e30ks"},
    -- { model = "drex6mlarte", label = "drex6mlarte"},
    -- { model = "CarsonsM4", label = "CarsonsM4"},
    -- { model = "bmwx7wb23", label = "bmwx7wb23"},
    -- { model = "bmwx7", label = "bmwx7"},
    -- { model = "bmwx6mbrando", label = "bmwx6mbrando"},
    -- { model = "bmwmafiam3", label = "bmwmafiam3"},
    -- { model = "bmwm8hycade", label = "bmwm8hycade"},
    -- { model = "bmwm82ncs", label = "bmwm82ncs"},
    -- { model = "BMWM5TOURING", label = "BMWM5TOURING"},
    -- { model = "BMWM5PRZEMO", label = "BMWM5PRZEMO"},
    -- { model = "BMWM5CS", label = "BMWM5CS"},
    -- { model = "BMWM5", label = "BMWM5"},
    -- { model = "bmwm4csl", label = "bmwm4csl"},
    -- { model = "BMWM2Manhart", label = "BMWM2Manhart"},
    -- { model = "bmwm2hycade", label = "bmwm2hycade"},
    -- { model = "bmwm2h", label = "bmwm2h"},
    -- { model = "bmwm2g87", label = "bmwm2g87"},
    -- { model = "bmwg20", label = "bmwg20"},
    -- { model = "bmwe39", label = "bmwe39"},
    -- { model = "bmwace", label = "bmwace"},
    -- { model = "bigsm2", label = "bigsm2"},
    -- { model = "alpinab7BLACKEDITION", label = "alpinab7BLACKEDITION"},
    -- { model = "abflugm2", label = "abflugm2"},
    -- { model = "850csi", label = "850csi"},
    -- { model = "640gt", label = "640gt"},
    -- { model = "36cab", label = "36cab"},
    -- { model = "2ncsbmwm8", label = "2ncsbmwm8"},
    -- { model = "23m2", label = "23m2"},
    -- { model = "22m135imperf", label = "22m135imperf"},
    -- { model = "22m135i", label = "22m135i"},
    -- { model = "20xb7", label = "20xb7"},
    -- { model = "20x5m", label = "20x5m"},
    -- { model = "1m2011", label = "1m2011"},
    -- { model = "18mh5", label = "18mh5"},
    -- { model = "14m4f82", label = "14m4f82"},
    -- { model = "16m4gts", label = "16m4gts"},
    -- { model = "17m4f82", label = "17m4f82"},
    -- { model = "18m4cs", label = "18m4cs"},
    -- { model = "16m4gts", label = "16m4gts"},
    -- { model = "18m4cs", label = "18m4cs"},
    }

-- Object/Prop Categories (world objects)
-- Add or remove props as needed. Use /shotprop <model> to capture unlisted props.
Customize.ObjectCategories = {
    -- Furniture
    { model = 'prop_bench_01a',       label = 'Park Bench' },
    { model = 'prop_bench_05',        label = 'Wooden Bench' },
    { model = 'prop_table_01',        label = 'Folding Table' },
    { model = 'prop_table_03',        label = 'Picnic Table' },
    { model = 'prop_chair_01a',       label = 'Folding Chair' },
    { model = 'prop_chair_04a',       label = 'Office Chair' },
    { model = 'prop_skid_chair_01',   label = 'Plastic Chair' },
    { model = 'prop_couch_01',        label = 'Couch' },
    { model = 'prop_bed_01',          label = 'Bed' },
    -- Containers
    { model = 'prop_barrel_01a',      label = 'Barrel' },
    { model = 'prop_cs_cardbox_01',   label = 'Cardboard Box' },
    { model = 'prop_box_wood01a',     label = 'Wood Crate' },
    { model = 'prop_bin_01a',         label = 'Trash Bin' },
    { model = 'prop_dumpster_01a',    label = 'Dumpster' },
    { model = 'prop_sacktruck_02a',   label = 'Hand Truck' },
    -- Electronics
    { model = 'prop_laptop_01a',      label = 'Laptop' },
    { model = 'prop_tv_flat_01',      label = 'Flat TV' },
    { model = 'prop_monitor_02',      label = 'Monitor' },
    { model = 'prop_radio_01',        label = 'Radio' },
    { model = 'prop_cs_tablet',       label = 'Tablet' },
    -- Food & Drink
    { model = 'prop_food_bs_burger3', label = 'Burger' },
    { model = 'prop_food_cb_donuts',  label = 'Donuts' },
    { model = 'prop_cs_beer_bot_01',  label = 'Beer Bottle' },
    { model = 'ng_proc_sodacan_01a',  label = 'Soda Can' },
    { model = 'prop_pizza_box_01',    label = 'Pizza Box' },
    -- Nature
    { model = 'prop_plant_int_01a',   label = 'Plant' },
    { model = 'prop_pot_plant_01a',   label = 'Pot Plant' },
    { model = 'prop_bush_lrg_04b',    label = 'Large Bush' },
    { model = 'prop_rock_4_a',        label = 'Rock' },
    -- Industrial
    { model = 'prop_barrier_work01a', label = 'Road Barrier' },
    { model = 'prop_cone_01a',        label = 'Traffic Cone' },
    { model = 'prop_toolchest_05',    label = 'Tool Chest' },
    { model = 'prop_jerrycan_01a',    label = 'Jerry Can' },
    { model = 'prop_fire_exting_1a',  label = 'Fire Extinguisher' },
    -- Weapons & Misc
    { model = 'prop_cs_katana_01',    label = 'Katana' },
    { model = 'prop_tool_hammer',     label = 'Hammer' },
    { model = 'prop_tool_wrench',     label = 'Wrench' },
    { model = 'prop_golf_bag_01',     label = 'Golf Bag' },
    { model = 'prop_bball_01',        label = 'Basketball' },
    { model = 'prop_tennis_ball',     label = 'Tennis Ball' },
}

-- Green Screen (Vehicles) — larger for cars
Customize.VehicleGreenScreen = {
    width       = 30.0,
    depth       = 30.0,
    height      = 15.0,
    floorOffset = -3.0,
}

-- Green Screen (Objects)
Customize.ObjectGreenScreen = {
    width       = 12.0,
    depth       = 12.0,
    height      = 10.0,
    floorOffset = -3.0,
}

-- Studio Lights (Vehicles) — wider range
Customize.VehicleStudioLights = {
    { offset = vector3(0.0, 8.0, 3.0),   range = 20.0, intensity = 4.0 },
    { offset = vector3(-8.0, 0.0, 3.0),  range = 15.0, intensity = 3.0 },
    { offset = vector3(8.0, 0.0, 3.0),   range = 15.0, intensity = 3.0 },
    { offset = vector3(0.0, -5.0, 3.0),  range = 12.0, intensity = 2.5 },
    { offset = vector3(0.0, 0.0, 8.0),   range = 18.0, intensity = 3.5 },
}
