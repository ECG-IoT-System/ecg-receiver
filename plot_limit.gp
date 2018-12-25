set terminal png size 1024,768
set xrange [1000:1500]
set grid
set title "Test Output" textcolor lt 1
set output"out_limit.png"
plot "./result/out.txt" with line
