rm -r *.deb
make pi-zero
make deb
sshpass -p 'raspberry' scp reef-pi-3.3.1-11-gd864068.deb pi@testpi:.
sshpass -p 'raspberry' ssh -t pi@testpi 'rm -r *.deb; sudo apt-get remove -y --purge reef-pi; sudo dpkg -i reef-pi-3.3.1-11-gd864068.deb'
