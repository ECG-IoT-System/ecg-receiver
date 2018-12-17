set terminal png size 1024,768
set grid
set title "Test Output" textcolor lt 1
set output"out.png"
plot "out.txt" with line
