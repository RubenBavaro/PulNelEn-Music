package com.example.pulnelenmusic;

import java.io.*;
import java.nio.file.Files;
import java.util.*;

public class PlaylistManager {
    private final String filePath;
    private String newLine = System.lineSeparator();

    public PlaylistManager(String filePath) {
        this.filePath = filePath;
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                file.getParentFile().mkdirs();
                file.createNewFile();
                initializeDefaultSongs();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void initializeDefaultSongs() throws IOException {
        // Add 5 default songs
        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write("default;Default Songs;" +
                    "Battito,Fedez,Pop,static/audio/song1.mp4,static/img/coverSong.png|" +
                    "Un ragazzo una ragazza,The Kolors,Pop,static/audio/song2.mp4,static/img/coverSong.png|" +
                    "La cura per me,Giorgia,Pop,static/audio/song3.mp4,static/img/coverSong1.png|" +
                    "Balorda Nostalgia,OLLY,Power ballad pop,static/audio/song4.mp4,static/img/coverSong1.png|" +
                    "Damme 'na mano,Tony Effe,Pop,static/audio/song5.mp4,static/img/coverSong1.png" +
                    newLine);
        }
    }

    public List<Song> getDefaultSongs() throws IOException {
        List<Song> defaultSongs = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("default;Default Songs;")) {
                    String[] parts = line.split(";", 3);
                    if (parts.length > 2) {
                        String[] songRecords = parts[2].split("\\|");
                        for (String songRecord : songRecords) {
                            defaultSongs.add(Song.fromRecord(songRecord));
                        }
                    }
                    break;
                }
            }
        }
        return defaultSongs;
    }

    public List<Playlist> getUserPlaylists(String user) throws IOException {
        List<Playlist> list = new ArrayList<>();
        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith(user + ";") && !line.split(";", 2)[1].startsWith("LASTPLAYED")) {
                    list.add(Playlist.fromRecord(line));
                }
            }
        }
        return list;
    }

    public void createPlaylist(Playlist playlist) throws IOException {
        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write(playlist.toRecord() + newLine);
        }
    }

    public void addSongToPlaylist(String user, String plName, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        boolean found = false;

        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";" + plName + ";")) {
                    if (l.split(";", 3).length > 2 && !l.split(";", 3)[2].isEmpty()) {
                        w.write(l + "|" + song.toRecord() + newLine);
                    } else {
                        w.write(user + ";" + plName + ";" + song.toRecord() + newLine);
                    }
                    found = true;
                } else {
                    w.write(l + newLine);
                }
            }

            if (!found) {
                Playlist playlist = new Playlist(user, plName);
                playlist.addSong(song);
                w.write(playlist.toRecord() + newLine);
            }
        }
    }

    public void removeSongFromPlaylist(String user, String plName, String title) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";" + plName + ";")) {
                    Playlist p = Playlist.fromRecord(l);
                    p.removeSong(title);
                    w.write(p.toRecord() + newLine);
                } else {
                    w.write(l + newLine);
                }
            }
        }
    }

    public Song getLastPlayed(String user) throws IOException {
        try (BufferedReader r = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith(user + ";LASTPLAYED;")) {
                    String[] parts = line.split(";", 3);
                    if (parts.length > 2) {
                        return Song.fromRecord(parts[2]);
                    }
                }
            }
        }

        // If no last played song found, return a random song from default songs
        List<Song> defaultSongs = getDefaultSongs();
        if (!defaultSongs.isEmpty()) {
            Random random = new Random();
            return defaultSongs.get(random.nextInt(defaultSongs.size()));
        }

        return null;
    }

    public void updateLastPlayed(String user, Song song) throws IOException {
        List<String> lines = Files.readAllLines(new File(filePath).toPath());
        boolean found = false;

        try (FileWriter w = new FileWriter(filePath, false)) {
            for (String l : lines) {
                if (l.startsWith(user + ";LASTPLAYED;")) {
                    w.write(user + ";LASTPLAYED;" + song.toRecord() + newLine);
                    found = true;
                } else {
                    w.write(l + newLine);
                }
            }

            if (!found) {
                w.write(user + ";LASTPLAYED;" + song.toRecord() + newLine);
            }
        }
    }
}