package com.example.pulnelenmusic;

public class Song {
    private String title, artist, genre;
    public Song(String t, String a, String g) { title = t; artist = a; genre = g; }
    public String getTitle()  { return title; }
    public String getArtist() { return artist; }
    public String getGenre()  { return genre;  }
    public String toRecord()  { return title + ";" + artist + ";" + genre; }
    public static Song fromRecord(String rec) {
        String[] p = rec.split(";");
        return new Song(p[0], p[1], p[2]);
    }
}
